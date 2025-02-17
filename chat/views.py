import os
from django.conf import settings
from django.shortcuts import render
from django.http import HttpResponse
from .form import EnvioArquivo
from .api import call


def index(request):
    if request.method == 'POST':
        form = EnvioArquivo(request.POST, request.FILES)
        if form.is_valid():
            arquivo = request.FILES['arquivo']
            destino = os.path.join(settings.MEDIA_ROOT, arquivo.name)
            print("Salvando em:", destino)
            os.makedirs(settings.MEDIA_ROOT, exist_ok=True)
            with open(destino, 'wb+') as f:
                for chunk in arquivo.chunks():
                    f.write(chunk)

            # Chamada do chat
            ai_response = call(nome=arquivo.name)
            print('Resposta de Ia retornada')
            return render(request, "chat/index.html", context={'ai_response': ai_response})
        else:
            # Caso o formulário não seja válido, reexibe o formulário com erros
            return render(request, "chat/form.html", {'form': form})
    else:
        form = EnvioArquivo()
    return render(request, "chat/form.html", {'form': form})
