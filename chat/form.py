from django import forms


class EnvioArquivo(forms.Form):
    arquivo = forms.FileField()
