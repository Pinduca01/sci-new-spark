-- Primeiro vou verificar e ajustar as constraints de status
-- Remover constraint existente se houver problema
ALTER TABLE bombeiros DROP CONSTRAINT IF EXISTS bombeiros_status_check;

-- Adicionar constraint correta para status
ALTER TABLE bombeiros ADD CONSTRAINT bombeiros_status_check 
CHECK (status IN ('ativo', 'ferias', 'licenca_medica', 'afastamento'));

-- Agora inserir com status correto
INSERT INTO bombeiros (nome, funcao, funcao_completa, equipe, status, turno, email, telefone, data_admissao, user_id, ferista) VALUES
('ARIDELCIO ARAUJO DO NASCIMENTO', 'BA-2', 'Bombeiro de Aeródromo (BA-2)', 'Delta', 'ativo', 'manha', 'aridelcio@bombeiros.com', '(11) 99999-0001', '2020-01-15', '00000000-0000-0000-0000-000000000001', false),
('BRENO AUGUSTO MARANHÃO', 'BA-MC', 'Motorista Condutor (BA-MC)', 'Alfa', 'ativo', 'manha', 'breno@bombeiros.com', '(11) 99999-0002', '2020-02-01', '00000000-0000-0000-0000-000000000001', false),
('CAMILA GODOY SILVA', 'BA-2', 'Bombeiro de Aeródromo (BA-2)', 'Delta', 'ativo', 'tarde', 'camila@bombeiros.com', '(11) 99999-0003', '2019-03-15', '00000000-0000-0000-0000-000000000001', false),
('CARMEN LÍDIA MASCARENHAS', 'BA-2', 'Bombeiro de Aeródromo (BA-2)', 'Charlie', 'ativo', 'manha', 'carmen@bombeiros.com', '(11) 99999-0004', '2018-04-20', '00000000-0000-0000-0000-000000000001', false),
('DIEGO DE JESUS RODRIGUES', 'BA-CE', 'Chefe de Equipe (BA-CE)', 'Delta', 'ativo', 'noite', 'diego@bombeiros.com', '(11) 99999-0005', '2017-05-10', '00000000-0000-0000-0000-000000000001', false),
('GABRIEL ARAÚJO LOPES', 'BA-MC', 'Motorista Condutor (BA-MC)', 'Charlie', 'ativo', 'tarde', 'gabriel.araujo@bombeiros.com', '(11) 99999-0006', '2020-06-30', '00000000-0000-0000-0000-000000000001', false),
('GABRIEL FERREIRA GONÇALVES', 'BA-LR', 'Líder de Resgate (BA-LR)', 'Delta', 'ativo', 'manha', 'gabriel.ferreira@bombeiros.com', '(11) 99999-0007', '2019-07-15', '00000000-0000-0000-0000-000000000001', false),
('GABRIEL MARTINS DE ABREU', 'BA-MC', 'Motorista Condutor (BA-MC)', 'Bravo', 'ativo', 'noite', 'gabriel.martins@bombeiros.com', '(11) 99999-0008', '2018-08-25', '00000000-0000-0000-0000-000000000001', false),
('GEDIAEL SANTOS FERREIRA', 'BA-CE', 'Chefe de Equipe (BA-CE)', 'Bravo', 'ativo', 'tarde', 'gediael@bombeiros.com', '(11) 99999-0009', '2017-09-12', '00000000-0000-0000-0000-000000000001', false),
('GUSTAVO ALVES DE SOUZA', 'BA-2', 'Bombeiro de Aeródromo (BA-2)', 'Bravo', 'ativo', 'manha', 'gustavo@bombeiros.com', '(11) 99999-0010', '2020-10-05', '00000000-0000-0000-0000-000000000001', false),
('HELI DE ALMEIDA NERES', 'BA-2', 'Bombeiro de Aeródromo (BA-2)', 'Charlie', 'ativo', 'tarde', 'heli@bombeiros.com', '(11) 99999-0011', '2019-11-20', '00000000-0000-0000-0000-000000000001', false),
('HENRIQUE ELER ASSUNÇÃO PINTO', 'BA-MC', 'Motorista Condutor (BA-MC)', 'Charlie', 'ativo', 'noite', 'henrique@bombeiros.com', '(11) 99999-0012', '2018-12-15', '00000000-0000-0000-0000-000000000001', false),
('IGOR ALMEIDA DOS SANTOS', 'BA-2', 'Bombeiro de Aeródromo (BA-2)', 'Charlie', 'ativo', 'manha', 'igor@bombeiros.com', '(11) 99999-0013', '2020-01-08', '00000000-0000-0000-0000-000000000001', false),
('JEFFERSON PEREIRA LOYOLA DOS SANTOS', 'BA-2', 'Bombeiro de Aeródromo (BA-2)', 'Charlie', 'ativo', 'tarde', 'jefferson@bombeiros.com', '(11) 99999-0014', '2019-02-18', '00000000-0000-0000-0000-000000000001', false),
('JONATAZ JÚNIOR DA SILVA NASCIMENTO', 'BA-MC', 'Motorista Condutor (BA-MC)', 'Alfa', 'ativo', 'noite', 'jonataz@bombeiros.com', '(11) 99999-0015', '2018-03-22', '00000000-0000-0000-0000-000000000001', false),
('JOSÉ ANTÔNIO DE MORAES LEAL', 'BA-2', 'Bombeiro de Aeródromo (BA-2)', 'Delta', 'ativo', 'manha', 'jose.antonio@bombeiros.com', '(11) 99999-0016', '2017-04-05', '00000000-0000-0000-0000-000000000001', false),
('KAIQUE CHARLES RATKEIVISZ', 'BA-LR', 'Líder de Resgate (BA-LR)', 'Charlie', 'ativo', 'tarde', 'kaique@bombeiros.com', '(11) 99999-0017', '2020-05-14', '00000000-0000-0000-0000-000000000001', false),
('LAURA MARIA CARVALHAIS DE SOUZA', 'BA-2', 'Bombeiro de Aeródromo (BA-2)', 'Alfa', 'ativo', 'noite', 'laura@bombeiros.com', '(11) 99999-0018', '2019-06-28', '00000000-0000-0000-0000-000000000001', false),
('LEANDRO SOARES GARCIA', 'BA-MC', 'Motorista Condutor (BA-MC)', 'Delta', 'ativo', 'manha', 'leandro@bombeiros.com', '(11) 99999-0019', '2018-07-10', '00000000-0000-0000-0000-000000000001', false),
('LEONARDO FERREIRA DA SILVA', 'BA-CE', 'Chefe de Equipe (BA-CE)', 'Charlie', 'ativo', 'tarde', 'leonardo@bombeiros.com', '(11) 99999-0020', '2017-08-03', '00000000-0000-0000-0000-000000000001', false),
('LUIS FERNANDO ABDON NUNES JÚNIOR', 'BA-MC', 'Motorista Condutor (BA-MC)', 'Bravo', 'ativo', 'noite', 'luis@bombeiros.com', '(11) 99999-0021', '2020-09-17', '00000000-0000-0000-0000-000000000001', false),
('MARCOS VINÍCIUS SILVA OLIVEIRA', 'BA-2', 'Bombeiro de Aeródromo (BA-2)', 'Bravo', 'ativo', 'manha', 'marcos@bombeiros.com', '(11) 99999-0022', '2019-10-25', '00000000-0000-0000-0000-000000000001', false),
('MATHEUS GOMES DOS SANTOS', 'BA-MC', 'Motorista Condutor (BA-MC)', 'Charlie', 'ativo', 'tarde', 'matheus@bombeiros.com', '(11) 99999-0023', '2018-11-12', '00000000-0000-0000-0000-000000000001', false),
('MAXWELL ALVES LOPES', 'BA-LR', 'Líder de Resgate (BA-LR)', 'Alfa', 'ativo', 'noite', 'maxwell@bombeiros.com', '(11) 99999-0024', '2017-12-07', '00000000-0000-0000-0000-000000000001', false),
('NÁRIA SANTANA DA SILVA', 'BA-2', 'Bombeiro de Aeródromo (BA-2)', 'Delta', 'ativo', 'manha', 'naria@bombeiros.com', '(11) 99999-0025', '2020-01-22', '00000000-0000-0000-0000-000000000001', false),
('NILTON DE SOUZA CABRAL FILHO', 'BA-2', 'Bombeiro de Aeródromo (BA-2)', 'Alfa', 'ativo', 'tarde', 'nilton@bombeiros.com', '(11) 99999-0026', '2019-02-13', '00000000-0000-0000-0000-000000000001', false),
('PAULO AUGUSTO CARDOSO NORONHA', 'BA-2', 'Bombeiro de Aeródromo (BA-2)', 'Bravo', 'ativo', 'noite', 'paulo.augusto@bombeiros.com', '(11) 99999-0027', '2018-03-19', '00000000-0000-0000-0000-000000000001', false),
('PAULO CÉSAR DA SILVA OLIVEIRA', 'BA-2', 'Bombeiro de Aeródromo (BA-2)', 'Delta', 'ativo', 'manha', 'paulo.cesar@bombeiros.com', '(11) 99999-0028', '2017-04-26', '00000000-0000-0000-0000-000000000001', false),
('PEDRO HENRIQUE NUNES RAMOS', 'BA-MC', 'Motorista Condutor (BA-MC)', 'Delta', 'ativo', 'tarde', 'pedro@bombeiros.com', '(11) 99999-0029', '2020-05-08', '00000000-0000-0000-0000-000000000001', false),
('RAFAEL BATISTA JUNQUEIRA', 'BA-2', 'Bombeiro de Aeródromo (BA-2)', 'Ferista', 'ativo', 'manha', 'rafael@bombeiros.com', '(11) 99999-0030', '2019-06-15', '00000000-0000-0000-0000-000000000001', true),
('RICARDO RODRIGUES GONÇALVES', 'BA-2', 'Bombeiro de Aeródromo (BA-2)', 'Alfa', 'ativo', 'noite', 'ricardo@bombeiros.com', '(11) 99999-0031', '2018-07-24', '00000000-0000-0000-0000-000000000001', false),
('ROGÉRIO ALVES MARTINS', 'BA-LR', 'Líder de Resgate (BA-LR)', 'Bravo', 'ativo', 'tarde', 'rogerio@bombeiros.com', '(11) 99999-0032', '2017-08-30', '00000000-0000-0000-0000-000000000001', false),
('RONAN MARTINS DA COSTA', 'BA-CE', 'Chefe de Equipe (BA-CE)', 'Alfa', 'ativo', 'manha', 'ronan@bombeiros.com', '(11) 99999-0033', '2020-09-11', '00000000-0000-0000-0000-000000000001', false),
('RONILDO TEODORO DA SILVA JÚNIOR', 'BA-MC', 'Motorista Condutor (BA-MC)', 'Alfa', 'ativo', 'noite', 'ronildo@bombeiros.com', '(11) 99999-0034', '2019-10-16', '00000000-0000-0000-0000-000000000001', false),
('SÍLVIO CÉSAR FERNANDES FILHO', 'BA-MC', 'Motorista Condutor (BA-MC)', 'Delta', 'ativo', 'tarde', 'silvio.cesar@bombeiros.com', '(11) 99999-0035', '2018-11-21', '00000000-0000-0000-0000-000000000001', false),
('SÍLVIO PASSOS DA SILVA', 'BA-2', 'Bombeiro de Aeródromo (BA-2)', 'Alfa', 'ativo', 'manha', 'silvio.passos@bombeiros.com', '(11) 99999-0036', '2017-12-04', '00000000-0000-0000-0000-000000000001', false),
('THAIS CRISTINA', 'BA-2', 'Bombeiro de Aeródromo (BA-2)', 'Ferista', 'ativo', 'noite', 'thais@bombeiros.com', '(11) 99999-0037', '2020-01-09', '00000000-0000-0000-0000-000000000001', true),
('THIAGO DE SOUZA MONTEIRO', 'BA-MC', 'Motorista Condutor (BA-MC)', 'Charlie', 'ativo', 'tarde', 'thiago@bombeiros.com', '(11) 99999-0038', '2019-02-27', '00000000-0000-0000-0000-000000000001', false),
('VICTOR ANTUNES BRETAS', 'BA-2', 'Bombeiro de Aeródromo (BA-2)', 'Bravo', 'ativo', 'manha', 'victor@bombeiros.com', '(11) 99999-0039', '2018-03-14', '00000000-0000-0000-0000-000000000001', false),
('VINÍCIUS LOPES DOS SANTOS', 'BA-MC', 'Motorista Condutor (BA-MC)', 'Bravo', 'ativo', 'noite', 'vinicius@bombeiros.com', '(11) 99999-0040', '2017-04-18', '00000000-0000-0000-0000-000000000001', false),
('WDSON JUNIOR PINHEIRO DA SILVA', 'BA-MC', 'Motorista Condutor (BA-MC)', 'Alfa', 'ativo', 'tarde', 'wdson@bombeiros.com', '(11) 99999-0041', '2020-05-23', '00000000-0000-0000-0000-000000000001', false),
('ZACARIAS KEVIN VIEIRA NUNES', 'BA-2', 'Bombeiro de Aeródromo (BA-2)', 'Bravo', 'ativo', 'manha', 'zacarias@bombeiros.com', '(11) 99999-0042', '2019-06-01', '00000000-0000-0000-0000-000000000001', false);