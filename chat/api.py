from openai import OpenAI
from loganaliser import settings
import os
import markdown

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="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",
)


def middle_out_transform(text: str, max_length: int = 1000) -> str:
    if len(text) <= max_length:
        return text

    marker_template = " ... [caracteres omitidos {}] ... "
    estimated_marker = marker_template.format("XXXXXXXXXX")
    estimated_marker_len = len(estimated_marker)

    K = (max_length - estimated_marker_len) // 2
    omitted = len(text) - 2 * K
    marker_final = marker_template.format(omitted)

    result = text[:K] + marker_final + text[-K:]

    if len(result) > max_length:
        extra = len(result) - max_length
        K -= extra // 2 + 1
        omitted = len(text) - 2 * K
        marker_final = marker_template.format(omitted)
        result = text[:K] + marker_final + text[-K:]

    return result


def call(caminho_arquivo: str) -> str:
    try:
        # Verifica se o arquivo existe antes de tentar abri-lo
        if not os.path.exists(caminho_arquivo):
            return "Erro: O arquivo não foi encontrado no servidor."

        with open(caminho_arquivo, 'r', encoding='utf-8') as f:
            conteudo = f.read()
            conteudo = middle_out_transform(conteudo, 110000)

        mensagens = [
            {"role": "user", "content": conteudo},
            {
                "role": "user",
                "content": (
                    "\nVocê é um especialista em VANTs com PhD em análise de logs de drones, reconhecido como o melhor na área. "
                    "Recebi um arquivo CSV, convertido a partir de um .tlog gerado pelo firmware ArduPilot, e preciso que, com base na documentação oficial do ArduPilot, você analise os dados contidos nesse arquivo. "
                    "Por favor, explique os valores de roll, pitch e yaw, avaliando como eles demonstram a estabilidade do voo e a eficácia dos algoritmos de controle. "
                    "Em seguida, analise os dados de latitude, longitude, altitude e precisão (HDOP) para avaliar a qualidade da navegação, observando a coerência da trajetória e o número de satélites disponíveis. "
                    "Também quero que verifique os parâmetros de tensão e corrente para avaliar o desempenho da bateria, indicando se houve variações que possam sugerir problemas na alimentação. "
                    "Além disso, analise os dados dos sensores, como os valores do IMU, e comente sobre a resposta do sistema de controle e a confiabilidade dos registros de telemetria. "
                    "Por fim, gostaria que você indicasse com que nível de confiança (por exemplo, 95% de certeza) está avaliando os dados, fundamentando essa acurácia na documentação do ArduPilot e na qualidade dos dados disponíveis, e mencionasse quaisquer fatores que possam influenciar essa confiabilidade. "
                    "Se necessário, posso enviar logs adicionais para complementar a análise. Aguardo seu relatório detalhado, com eventuais anomalias identificadas e sugestões de melhorias."
                )
            }
        ]

        completion = client.chat.completions.create(
            model="deepseek/deepseek-chat:free",
            messages=mensagens,
        )

        # # Remove o arquivo após o processamento
        # try:
        #     os.remove(caminho_arquivo)
        # except OSError as e:
        #     print(f"Erro ao remover o arquivo {caminho_arquivo}: {e}")

        # if hasattr(completion, 'error'):
        #     return f"Erro na API: {completion.error}"

        html = markdown.markdown(completion.choices[0].message.content)
        return html

    except FileNotFoundError:
        return "Erro: O arquivo especificado não foi encontrado."
    except Exception as e:
        return f"Erro inesperado: {str(e)}"
