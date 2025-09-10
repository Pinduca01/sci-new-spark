-- Consulta para verificar os dados reais na tabela agentes_extintores
SELECT 
    id,
    tipo,
    fabricante,
    lote,
    quantidade,
    unidade,
    data_fabricacao,
    data_validade,
    situacao,
    created_at
FROM agentes_extintores 
ORDER BY created_at DESC;