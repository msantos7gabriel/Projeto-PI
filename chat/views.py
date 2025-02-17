from django.shortcuts import render
from django.http import HttpResponse
from .form import EnvioArquivo
from .api import call


def index(request):
    if request.method != 'POST':
        form = EnvioArquivo(request.POST, request.FILES)
        if form.is_valid():
            arquivo = request.FILES['arquivo']
            with open(f'seu/diretorio/{arquivo.name}', 'wb+') as destino:
                for chunk in arquivo.chunks():
                    destino.write(chunk)
            return render(request, "chat/form.html")
    else:
        form = EnvioArquivo()
        render(request, "chat/form.html")

    return render(request, "chat/index.html")
    # chat_response = call('oi')
    # context = {'chat_response': chat_response}
    return render(request, "chat/index.html")
