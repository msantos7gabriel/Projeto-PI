import os
import asyncio
from django.conf import settings
from django.shortcuts import render
from .form import EnvioArquivo
from .api import call

async def index(request):
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

            # Chamada assíncrona do chat
            ai_response = await asyncio.to_thread(call, arquivo.name)
            print('Resposta de Ia retornada')
            return render(request, "chat/index.html", context={'ai_response': ai_response})
        else:
            return render(request, "chat/form.html", {'form': form})
    else:
        form = EnvioArquivo()
    return render(request, "chat/form.html", {'form': form})
