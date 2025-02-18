import pandas as pd
import math

def split_csv_by_rows(input_csv: str, max_rows: int = 50) -> None:
    # Carrega o CSV em um DataFrame
    df = pd.read_csv(input_csv)
    total_rows = df.shape[0]
    # Calcula quantos arquivos serão gerados
    num_files = math.ceil(total_rows / max_rows)
    
    for i in range(num_files):
        start = i * max_rows
        end = start + max_rows
        # Seleciona o subconjunto de linhas para este arquivo
        df_chunk = df.iloc[start:end]
        output_file = f"split_rows_{i+1}.csv"
        # Exporta o subconjunto para um novo arquivo CSV, com o cabeçalho
        df_chunk.to_csv(output_file, index=False)
        print(f"Arquivo gerado: {output_file} com {df_chunk.shape[0]} linhas.")

# Exemplo de uso:
split_csv_by_rows("log_processado_grouped_polido.csv", max_rows=50)
