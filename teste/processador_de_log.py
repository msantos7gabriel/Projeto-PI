import re
import csv
import datetime
from collections import defaultdict
from typing import List, Dict, Any, Optional

# Defina os campos essenciais que deseja manter para a análise
CAMPOS_ESSENCIAIS = {
    "time_boot_ms", "roll", "pitch", "yaw", "rollspeed",
    "pitchspeed", "yawspeed", "airspeed", "groundspeed",
    "alt", "climb", "heading", "custom_mode", "type",
    "autopilot", "base_mode", "system_status", "mavlink_version",
    "lat", "lng", "altitude", "load", "voltage_battery", "current_battery"
    # Adicione outros campos conforme necessário...
}

def parse_line(linha: str) -> Optional[Dict[str, Any]]:
    """
    Faz o parsing de uma linha do log e extrai os campos relevantes.
    Retorna um dicionário com:
      - 'datetime': objeto datetime (ou None)
      - 'code': código (ex.: "FD" ou "FE")
      - 'message_type': tipo de mensagem (ex.: "attitude_t")
      - 'payload': payload original (string)
    Retorna None se a linha não corresponder ao padrão esperado.
    """
    pattern = (
        r"^(?P<datetime>\d{2}/\d{2}/\d{4}\s+\d{2}:\d{2}:\d{2})\s+"
        r"(?P<code>\S+).*?mavlink_(?P<message_type>\w+_t)\s+(?P<payload>.*)$"
    )
    match = re.search(pattern, linha)
    if not match:
        return None
    try:
        dt = datetime.datetime.strptime(match.group("datetime"), "%d/%m/%Y %H:%M:%S")
    except ValueError:
        dt = None
    return {
        "datetime": dt,
        "code": match.group("code"),
        "message_type": match.group("message_type"),
        "payload": match.group("payload").strip()
    }

def extrair_parametros(payload: str) -> Dict[str, str]:
    """
    Extrai pares chave-valor do payload.
    Remove a parte final com "sig Len ... crc16 ...".
    Para cada valor numérico:
      - Se o campo estiver em CAMPOS_ESSENCIAIS, arredonda para 3 casas decimais.
      - Caso contrário, arredonda para 1 casa.
    Retorna um dicionário dos parâmetros extraídos.
    """
    # Remove a parte final que contém "sig Len" e "crc16"
    payload = re.sub(r"\s+sig\s+Len\s+\d+\s+crc16\s+\d+", "", payload)
    # Captura pares no formato: chave valor (onde valor pode conter vírgula ou ponto como separador decimal)
    pares = re.findall(r"(\w+)\s+([-+]?\d*[.,]?\d+)", payload)
    params = {}
    for chave, valor in pares:
        # Normaliza separador decimal (troca vírgula por ponto)
        valor_norm = valor.replace(',', '.')
        try:
            num = float(valor_norm)
            if chave in CAMPOS_ESSENCIAIS:
                params[chave] = f"{num:.3f}"
            else:
                params[chave] = f"{num:.1f}"
        except ValueError:
            params[chave] = valor
    return params

def polir_payload(payload: str) -> str:
    """
    Processa o payload extraindo os parâmetros e reconstruindo uma versão resumida.
    Apenas os campos essenciais são mantidos, organizados no formato:
      chave=valor; chave=valor; ...
    """
    params = extrair_parametros(payload)
    # Filtra apenas os campos essenciais
    params_filtrados = {k: v for k, v in params.items() if k in CAMPOS_ESSENCIAIS}
    # Ordena as chaves para consistência
    itens_ordenados = sorted(params_filtrados.items())
    return "; ".join(f"{chave}={valor}" for chave, valor in itens_ordenados)

def ler_logs(arquivo: str) -> List[Dict[str, Any]]:
    """
    Lê o arquivo de log e retorna uma lista de registros com os dados extraídos,
    aplicando o polimento do payload.
    """
    registros = []
    with open(arquivo, "r", encoding="utf-8") as f:
        for linha in f:
            linha = linha.strip()
            if linha:
                registro = parse_line(linha)
                if registro:
                    registro["payload"] = polir_payload(registro["payload"])
                    registros.append(registro)
    return registros

def agrupar_registros(registros: List[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
    """
    Agrupa os registros por data/hora e código.
    Retorna um dicionário com chave "datetime_code" e valor contendo:
      - 'message_types': conjunto de tipos de mensagem
      - 'payloads': lista de payloads (polidos) dos registros agrupados
    """
    agrupados = defaultdict(lambda: {"message_types": set(), "payloads": []})
    for reg in registros:
        dt_str = reg["datetime"].strftime("%d/%m/%Y %H:%M:%S") if reg["datetime"] else ""
        chave = f"{dt_str} {reg['code']}"
        agrupados[chave]["message_types"].add(reg["message_type"])
        agrupados[chave]["payloads"].append(reg["payload"])
    return agrupados

def exportar_csv(agrupados: Dict[str, Dict[str, Any]], nome_csv: str) -> None:
    """
    Exporta os registros agrupados para um arquivo CSV.
    As colunas do CSV serão:
      - datetime_code: data/hora e código concatenados
      - message_types: tipos de mensagem agrupados (separados por ';')
      - payloads: payloads concatenados (separados por " | ")
    """
    with open(nome_csv, "w", newline="", encoding="utf-8") as csvfile:
        fieldnames = ["datetime_code", "message_types", "payloads"]
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for chave, dados in agrupados.items():
            writer.writerow({
                "datetime_code": chave,
                "message_types": ";".join(sorted(dados["message_types"])),
                "payloads": " | ".join(dados["payloads"])
            })

def main():
    arquivo_log = "seu_arquivo.txt"  # Substitua pelo caminho do seu arquivo de log
    arquivo_csv = "log_processado_grouped_polido.csv"
    registros = ler_logs(arquivo_log)
    if not registros:
        print("Nenhum dado foi extraído do log.")
        return
    agrupados = agrupar_registros(registros)
    exportar_csv(agrupados, arquivo_csv)
    print(f"Arquivo CSV '{arquivo_csv}' gerado com sucesso!")

if __name__ == "__main__":
    main()
