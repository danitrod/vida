import { Metadata } from "next";
import { trackPageView } from "@/lib/analytics";

// Privacy policy (in Portuguese, like the rest of the site's content).
// Keep it in sync with what the code actually collects: see the "Privacy"
// section in AGENTS.md. Update LAST_UPDATED on every content change.

const LAST_UPDATED = "21 de novembro de 2026";

export const metadata: Metadata = {
  title: "vida | Privacidade",
  description: "Como este site trata seus dados.",
};

export default async function PrivacyPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await trackPageView("/privacidade", await props.searchParams);

  return (
    <main className="px-4 py-8 sm:px-8 md:px-16 lg:px-32">
      <article
        className="prose prose-neutral dark:prose-invert max-w-3xl mx-auto"
        style={
          {
            "--tw-prose-body": "var(--foreground)",
            "--tw-prose-headings": "var(--foreground)",
            "--tw-prose-links": "var(--foreground)",
            "--tw-prose-bold": "var(--foreground)",
            "--tw-prose-th-borders": "var(--color-light)",
            "--tw-prose-td-borders": "var(--color-light)",
          } as React.CSSProperties
        }
      >
        <h1>Privacidade</h1>
        <p className="text-sm opacity-70">Última atualização: {LAST_UPDATED}</p>

        <p>
          Este é um blog pessoal. Tento coletar o mínimo possível: não há
          anúncios, rastreadores de terceiros nem cookies de publicidade, e
          nenhum dado é vendido ou compartilhado para marketing. Abaixo está
          tudo o que o site guarda e por quê.
        </p>

        <h2>Ao ler os textos</h2>
        <p>
          Para saber quantas pessoas leem cada texto e de onde elas vêm, cada
          visita registra:
        </p>
        <ul>
          <li>data e hora, e a página visitada;</li>
          <li>
            tipo de dispositivo (celular, tablet ou computador), navegador e
            sistema operacional, e se você abriu o link de dentro de um app
            (como Instagram ou Facebook);
          </li>
          <li>
            o site de origem, só o domínio (por exemplo,
            &quot;instagram.com&quot;);
          </li>
          <li>
            parâmetros de campanha presentes no link (<code>utm_*</code>) e
            identificadores de clique que redes sociais e anúncios adicionam aos
            links, como <code>fbclid</code> (Facebook) e <code>igsh</code>{" "}
            (Instagram);
          </li>
          <li>
            um identificador diário, calculado a partir do endereço IP e do
            navegador com uma chave secreta. Ele muda todo dia e serve apenas
            para contar visitantes únicos em um dia; o endereço IP em si não é
            guardado.
          </li>
        </ul>
        <p>
          Isso é feito sem cookies. Robôs e acessos automatizados não são
          contados.
        </p>
        <p>
          Alguns textos mencionam o tipo do seu dispositivo (por exemplo,
          &quot;iPhone&quot;). Essa informação vem do seu navegador, é usada só
          para montar a página que você está vendo e não é guardada.
        </p>

        <h2>Se você criar uma conta</h2>
        <p>
          Guardo seu nome de usuário, e-mail, senha (apenas em forma
          criptografada, nunca a senha em si), se você quer receber avisos de
          novos posts por e-mail, e as datas de criação e atualização da conta.
          Seu e-mail só é usado para login e, se você escolher, para avisar
          sobre novos posts.
        </p>

        <h2>Comentários e curtidas</h2>
        <p>
          Comentários são públicos e guardam o texto, o nome exibido e a data.
          Curtidas guardam o post e quem curtiu. Sem conta, um identificador
          aleatório (num cookie) guarda seus comentários e curtidas ao seu
          navegador, para que você possa editá-los ou apagá-los.
        </p>

        <h2>Cookies</h2>
        <p>
          Só existem cookies necessários para funções que você usa. Nenhum é de
          terceiros, de rastreamento ou de publicidade.
        </p>
        <table>
          <thead>
            <tr>
              <th>Cookie</th>
              <th>Para quê</th>
              <th>Duração</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>auth_token</code>
              </td>
              <td>Manter você logado (só se você fizer login).</td>
              <td>180 dias</td>
            </tr>
            <tr>
              <td>
                <code>anon_comment_token</code>
              </td>
              <td>
                Identificar seus comentários e curtidas sem conta (só quando
                você comenta ou curte).
              </td>
              <td>90 dias</td>
            </tr>
            <tr>
              <td>
                <code>theme</code>
              </td>
              <td>Lembrar o tema claro ou escuro (só se você mudar o tema).</td>
              <td>1 ano</td>
            </tr>
          </tbody>
        </table>

        <h2>Base legal</h2>
        <p>
          Conta, comentários e curtidas: para prestar o serviço que você pediu
          (LGPD, art. 7º, V; GDPR, art. 6(1)(b)). Estatísticas de visitas:
          legítimo interesse em entender o alcance dos textos, com dados
          minimizados e sem identificar você (LGPD, art. 7º, IX; GDPR, art.
          6(1)(f)). Você pode se opor a esse uso a qualquer momento.
        </p>

        <h2>Onde os dados ficam e com quem</h2>
        <p>
          Os dados ficam com provedores de infraestrutura na nuvem (hospedagem
          e banco de dados). O provedor de hospedagem pode manter registros
          técnicos de acesso (como endereço IP) por segurança. Esses serviços
          podem estar fora do Brasil e só processam os dados para manter o site
          funcionando. As fontes do site são servidas pelo próprio site, e links
          externos (como Instagram ou Wikipédia) só são acessados se você clicar
          neles.
        </p>

        <h2>Por quanto tempo</h2>
        <ul>
          <li>Conta: até você pedir a exclusão.</li>
          <li>
            Comentários e curtidas: até você apagá-los ou pedir a exclusão.
          </li>
          <li>
            Estatísticas de visitas: apagadas automaticamente após 2 anos.
          </li>
          <li>Cookies: pelo tempo indicado na tabela acima.</li>
        </ul>

        <h2>Seus direitos</h2>
        <p>
          Você pode pedir acesso, correção, cópia ou exclusão dos seus dados, e
          se opor às estatísticas. Nome de usuário, comentários e curtidas podem
          ser alterados ou apagados direto no site. Você também pode reclamar à
          ANPD (no Brasil) ou à autoridade de proteção de dados do seu país.
        </p>

        <h2>Contato</h2>
        <p>
          O responsável por este site é Daniel T. Rodrigues. Para qualquer
          pedido ou dúvida sobre seus dados, escreva para{" "}
          <a href="mailto:danitrod@proton.me">danitrod@proton.me</a>.
        </p>

        <h2>Mudanças</h2>
        <p>
          Se algo mudar na forma como os dados são tratados, esta página será
          atualizada, com a data no topo.
        </p>
      </article>
    </main>
  );
}
