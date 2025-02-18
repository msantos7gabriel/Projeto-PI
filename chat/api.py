from openai import OpenAI
from loganaliser import settings
import os

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="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",
)


def call(nome):
    caminho_arquivo = os.path.join(settings.MEDIA_ROOT, nome)
    with open(caminho_arquivo, 'r', encoding='utf-8') as f:
        conteudo = f.read()

    # Em vez de concatenar tudo em uma única string, separe em duas mensagens:
    mensagens = [
        {
            "role": "user",
            "content": conteudo  # Conteúdo do arquivo
        },

    ]

    completion = client.chat.completions.create(
        model="deepseek/deepseek-chat:free",
        messages=mensagens
    )
    os.remove(caminho_arquivo)
    try:
        return completion.choices[0].message.content
    except:
        return "Não foi retornado resultados"
