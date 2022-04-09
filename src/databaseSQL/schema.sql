CREATE DATABASE dindin;

CREATE TABLE usuarios (
	id serial PRIMARY KEY,
    nome text NOT NULL, 
	email text NOT NULL UNIQUE,  
	senha text NOT NULL
);

CREATE TABLE categorias(
	id serial PRIMARY KEY, 
	descricao text NOT NULL
);

CREATE TABLE transacoes(
	id serial PRIMARY KEY,
	descricao text, 
	valor integer NOT NULL, 
	data timestamp NOT NULL, 
	categoria_id integer NOT NULL, 
	usuario_id integer NOT NULL,
	tipo text NOT NULL,
	FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)	
);

INSERT INTO categorias(descricao)
VALUES
('Alimentação'),
('Assinaturas e Serviços'),
('Casa'),
('Mercado'),
('Cuidados Pessoais'),
('Educação'),
('Família'),
('Lazer'),
('Pets'),
('Presentes'),
('Roupas'),
('Saúde'),
('Transporte'),
('Salário'),
('Vendas'),
('Outras receitas'),
('Outras despesas');