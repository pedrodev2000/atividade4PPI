import express from 'express';
import path from 'path';
import session from 'express-session';
import { resolveSoa } from 'dns';
import cookieParser from 'cookie-parser';

const host = '0.0.0.0';
const porta = 3000;

let listaUsuario=[];
let usuarioAutenticado = false;

const app = express();

app.use(session({
    secret: 'chavescreta',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 15
    }
}));

app.use(cookieParser());

app.use(express.static(path.join(process.cwd(), 'publico')));
app.use(express.urlencoded({extendend: true}));

function usuarioEstaAutenticado (requisicao, resposta, next)
{
    if(requisicao.session.usuarioAutenticado)
    {
        next();
    }
    else
    {
        resposta.redirect('/login.html');
    }
}

function autenticarUsuario(requisicao, resposta)
{   
    const usuario = requisicao.body.user;
    const senha = requisicao.body.senha;
    if(usuario == 'admin' && senha == '123')
    {
        requisicao.session.usuarioAutenticado = true;
        resposta.cookie('dataUltimoAcesso', new Date().toLocaleString(), {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 30
        });
        resposta.redirect('/');
    }
    else{
        resposta.write('<!DOCTYPE html>');
        resposta.write('<html>');
        resposta.write('<head>');
        resposta.write('<meta charset="UTF-8">');
        resposta.write('<title>Falha ao realizar login</title>');
        resposta.write('</head>');
        resposta.write('<body>');
        resposta.write('<p>Usuário ou senha inválidos!</p>');
        resposta.write('<a href="/login.html">Voltar</a>');
        if (requisicao.cookies.dataUltimoAcesso){
            resposta.write('<p>');
            resposta.write('Seu último acesso foi em ' + requisicao.cookies.dataUltimoAcesso);
            resposta.write('</p>');
        }
        resposta.write('</body>');
        resposta.write('</html>');
        //resposta.write('<input type="button" value="Voltar" onclick="history.go(-1)"/>');
        resposta.end();
    }
}

app.post ('/login', autenticarUsuario);

app.get('/login', (req,resp)=>{
    resp.redirect('/login.html');
});

app.get('/logout', (req,resp)=>{

    req.session.destroy();
    resp.redirect('/login.html');
});

function cadastrarProduto (requisicao, resposta) 
{
    const nome = requisicao.body.nome;
    const barras = requisicao.body.barras;
    const precoCusto = requisicao.body.precoCusto;
    const precoVenda = requisicao.body.precoVenda;
    const data = requisicao.body.data;
    const qtd = requisicao.body.qtd;
    const desc = requisicao.body.desc;

    if(nome && barras && precoCusto && precoVenda && data && qtd && desc)
    {
        listaUsuario.push({
            nome: nome,
            barras: barras,
            precoCusto: precoCusto,
            precoVenda: precoVenda,
            data: data,
            qtd: qtd,
            desc, desc
        })
        resposta.redirect('/listarProdutos');
    }
    else
    {
        resposta.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
            <title>Document</title>
        </head>
        <body class="p-3 mt-5 border-0 bd-example m-0 border-0">
            
            <div class="container">
            <div class="row justify-content-center">
            <div class="col-md-6 col-lg-5">
                <form class="row g-3" method="POST" action="/cadastrarProduto">
                    <legend class="container justify-content-center bg-primary-subtle text-black align text-center rounded">Cadastro de produtos</legend>
                    <div class="col-4">
                        <label for="barras" class="form-label">Codigo de barras</label>
                        <input type="text" class="form-control" id="barras" name="barras" value=${barras}>
                    </div>`);

                    if(barras == "")
                    {
                        resposta.write(`
                        <p style="color: white; background-color: lightcoral; padding: 6px; position: relative; bottom: 12px;">Codigo de barras invalido!</p>
                        `);
                    }

                    resposta.write(`
                    <div class="col-4">
                        <label for="precoCusto" class="form-label">Preço de custo</label>
                        <input type="text" class="form-control" id="precoCusto" name="precoCusto" value=${precoCusto}>
                    </div>`);

                    if(precoCusto == "")
                    {
                        resposta.write(`
                        <p style="color: white; background-color: lightcoral; padding: 8px; position: relative; bottom: 15px;">Preco de custo invalido</p>
                        `);
                    }

                    resposta.write(`
                    <div class="col-4">
                        <label for="precoVenda" class="form-label">Preço de venda</label>
                        <input type="text" class="form-control" id="precoVenda" name="precoVenda" value=${precoVenda}>
                    </div> `);

                    if(precoVenda == "")
                    {
                        resposta.write(`
                        <p style="color: white; background-color: lightcoral; padding: 8px; position: relative; bottom: 15px;">Preco de venda invalido</p>
                        `);
                    }

                    resposta.write(`
                    <div class="col-md-6">
                        <label for="data" class="form-label">Data</label>
                        <input type="date" class="form-control" id="data" name="data" value=${data}>
                    </div> `);

                    if(data == "")
                    {
                        resposta.write(`
                        <p style="color: white; background-color: lightcoral; padding: 8px; position: relative; bottom: 15px;">Preco de venda invalido</p>
                        `);
                    }

                    resposta.write(`
                    <div class="col-md-6">
                        <label for="qtd" class="form-label">Quantidade em estoque</label>
                        <input type="text" class="form-control" id="qtd" name="qtd" value=${qtd}>
                    </div>`);

                    if(qtd == "")
                    {
                        resposta.write(`
                        <p style="color: white; background-color: lightcoral; padding: 8px; position: relative; bottom: 15px;">Quantidade invalida!</p>
                        `);
                    }

                    resposta.write(`
                    <div class="col-md-12">
                        <label for="desc" class="form-label">Descrição do produto</label>
                        <input type="text" class="form-control" id="desc" name="desc" value=${desc}>
                    </div>`);

                    if(desc == "")
                    {
                        resposta.write(`
                        <p style="color: white; background-color: lightcoral; padding: 8px; position: relative; bottom: 15px;">Descrição invalida!</p>
                        `);
                    }

                    resposta.write(`
                    <div class="col-md-12">
                        <label for="nome" class="form-label">Nome do fabricante</label>
                        <input type="text" class="form-control" id="nome" name="nome" value=${nome}>
                    </div>`);

                    if(nome == "")
                    {
                        resposta.write(`
                        <p style="color: white; background-color: lightcoral; padding: 8px; position: relative; bottom: 15px;">Nome invalido!</p>
                        `);
                    }

                    resposta.write(`
                    <div class="col-12">
                        <button type="submit" class="btn btn-primary container">Cadastrar</button>
                    </div>

                    <div class="container">
                            <a href="/">Voltar</a>
                            <a href="/listarProdutos">Listar Produtos</a>
                        </div>
                        </div>
                    </div>
                    

                    </form>
            </div>
            </div>
            </div>

            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>

        </body>
        </html>

        `);
    }
}

app.get('/listarProdutos', (req,resp) => {
    resp.write("<!DOCTYPE html>");
    resp.write("<html lang='en'>");
    resp.write("<head>");
    resp.write("    <meta charset='UTF-8'>");
    resp.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">');
    resp.write("    <meta name='viewport' content='width=device-width, initial-scale=1.0'>");
    resp.write("    <title>Alunos cadastrados</title>");
    resp.write("</head>");
    resp.write("<body>");
    resp.write("<table class='table table-dark table-striped m-5 w-50'>");
    resp.write('<tr>');
    resp.write('<th>Nome do fabricante</th>');
    resp.write('<th>Descrição do produto</th>');
    resp.write('<th>Preço de custo</th>');
    resp.write('<th>Preço de venda</th>');
    resp.write('<th>Data</th>');
    resp.write('<th>Quantidade em estoque</th>');
    resp.write('<th><a href="/cadastro.html" style="color: green;text-decoration: none;">Cadastrar produtos</a></th>');
    resp.write('</tr>');

    for(let i=0;i<listaUsuario.length;i++)
    {
        resp.write('<tr>');
        resp.write(`<td>${listaUsuario[i].nome}</td>`);
        resp.write(`<td>${listaUsuario[i].desc}</td>`);
        resp.write(`<td>${listaUsuario[i].precoCusto}</td>`);
        resp.write(`<td>${listaUsuario[i].precoVenda}</td>`);
        resp.write(`<td>${listaUsuario[i].data}</td>`);
        resp.write(`<td>${listaUsuario[i].qtd}</td>`);
        resp.write('</tr>');
    }
    resp.write('</table>');
    resp.write("</br>");
    if (req.cookies.dataUltimoAcesso){
        resp.write('<p>');
        resp.write('Seu último acesso foi em ' + req.cookies.dataUltimoAcesso);
        resp.write('</p>');
    }
    resp.write("</body>");
    resp.write('<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>');
    resp.write("</html>");
    resp.end();
    
});

app.use(usuarioEstaAutenticado,express.static(path.join(process.cwd(), 'protegido')));
app.post('/cadastrarProduto', cadastrarProduto);

app.listen(porta,host,() => {
    console.log(`Servidor rodando em http://${host}:${porta}`);
})