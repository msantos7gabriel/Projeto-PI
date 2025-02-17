from openai import OpenAI

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="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",
)


def call(prompt="Você é um especialista em VANTs com PhD em análise de logs de drones, reconhecido como o melhor na área. Recebi um arquivo CSV, convertido a partir de um .tlog gerado pelo firmware ArduPilot, e preciso que, com base na documentação oficial do ArduPilot, você analise os dados contidos nesse arquivo. Por favor, explique os valores de roll, pitch e yaw, avaliando como eles demonstram a estabilidade do voo e a eficácia dos algoritmos de controle. Em seguida, analise os dados de latitude, longitude, altitude e precisão (HDOP) para avaliar a qualidade da navegação, observando a coerência da trajetória e o número de satélites disponíveis. Também quero que verifique os parâmetros de tensão e corrente para avaliar o desempenho da bateria, indicando se houve variações que possam sugerir problemas na alimentação. Além disso, analise os dados dos sensores, como os valores do IMU, e comente sobre a resposta do sistema de controle e a confiabilidade dos registros de telemetria. Por fim, gostaria que você indicasse com que nível de confiança (por exemplo, 95% de certeza) está avaliando os dados, fundamentando essa acurácia na documentação do ArduPilot e na qualidade dos dados disponíveis, e mencionasse quaisquer fatores que possam influenciar essa confiabilidade. Se necessário, posso enviar logs adicionais para complementar a análise. Aguardo seu relatório detalhado, com eventuais anomalias identificadas e sugestões de melhorias."):
    completion = client.chat.completions.create(
        extra_headers={},
        extra_body={},
        model="deepseek/deepseek-chat:free",
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ]
    )
    return completion.choices[0].message.content
