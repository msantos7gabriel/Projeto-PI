from openai import OpenAI

client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key="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",
)

def call(prompt="Apenas responda para mim: 'Não entendi.'"):
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
    return completion