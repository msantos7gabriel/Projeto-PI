from django.forms import forms


class EnvioArquivo(forms.Form):
    arquivo = forms.FileField()
    
