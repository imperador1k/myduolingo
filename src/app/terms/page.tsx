import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
    title: "Termos de Utilização",
    description: "Lê os termos e condições de utilização da plataforma MyDuolingo e os teus direitos como utilizador.",
    alternates: {
        canonical: "/terms",
    },
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#fbf9f8] py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="flex flex-col items-center text-center mb-12 space-y-4">
                    <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-2xl flex items-center justify-center border-2 border-stone-200 mb-2">
                        <FileText className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-stone-700 tracking-tight">Termos de Utilização</h1>
                    <div className="bg-stone-200 text-stone-500 font-bold text-xs px-4 py-2 rounded-full uppercase tracking-widest mt-4">
                        Última Atualização: 7 de Abril de 2026
                    </div>
                </div>

                <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 md:p-8 mb-8 transition-all hover:bg-stone-50">
                    <h2 className="text-2xl font-black text-[#1CB0F6] mb-4">Acordo com os Nossos Termos Legais</h2>
                    <div className="space-y-4 text-lg text-stone-600 leading-relaxed font-medium">
                        <p>Somos a MyDuolingo ("Empresa", "nós", "nos" ou "nosso"). Operamos a aplicação bem como quaisquer outros produtos e serviços relacionados que remetam ou liguem a estes termos legais (os "Termos Legais") (coletivamente, os "Serviços").</p>
                        <p>Pode contactar-nos através dos meios disponibilizados na aplicação.</p>
                        <p>Estes Termos Legais constituem um acordo juridicamente vinculativo celebrado entre si, seja a título pessoal ou em nome de uma entidade ("você"), e a MyDuolingo, relativamente ao seu acesso e utilização dos Serviços. Ao aceder aos Serviços, declara que leu, compreendeu e concordou com todos estes Termos Legais. SE NÃO CONCORDAR COM A TOTALIDADE DESTES TERMOS LEGAIS, ESTÁ EXPRESSAMENTE PROIBIDO DE UTILIZAR OS SERVIÇOS E DEVE CESSAR A UTILIZAÇÃO IMEDIATAMENTE.</p>
                        <p>Quaisquer termos e condições ou documentos suplementares que possam ser publicados nos Serviços de tempos a tempos são expressamente incorporados por referência. Reservamo-nos o direito, a nosso exclusivo critério, de fazer alterações ou modificações a estes Termos Legais a qualquer momento e por qualquer motivo.</p>
                    </div>
                </div>

                <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 md:p-8 mb-8 transition-all hover:bg-stone-50">
                    <h2 className="text-2xl font-black text-[#1CB0F6] mb-4">1. Os Nossos Serviços</h2>
                    <div className="space-y-4 text-lg text-stone-600 leading-relaxed font-medium">
                        <p>As informações fornecidas aquando da utilização dos Serviços não se destinam a distribuição ou utilização por qualquer pessoa ou entidade em qualquer jurisdição ou país onde tal distribuição ou utilização seja contrária à lei ou regulamentação ou que nos sujeite a qualquer requisito de registo nessa jurisdição ou país. Assim, as pessoas que optem por aceder aos Serviços a partir de outros locais fazem-no por sua própria iniciativa e são exclusivamente responsáveis pelo cumprimento das leis locais, se e na medida em que as leis locais sejam aplicáveis.</p>
                    </div>
                </div>

                <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 md:p-8 mb-8 transition-all hover:bg-stone-50">
                    <h2 className="text-2xl font-black text-[#1CB0F6] mb-4">2. Direitos de Propriedade Intelectual</h2>
                    <div className="space-y-4 text-lg text-stone-600 leading-relaxed font-medium">
                        <p><strong>Nossa propriedade intelectual:</strong> Somos os titulares ou licenciados de todos os direitos de propriedade intelectual nos nossos Serviços, incluindo todo o código-fonte, bases de dados, funcionalidade, software, designs de websites, áudio, vídeo, texto, fotografias e gráficos nos Serviços (coletivamente, o "Conteúdo"), bem como as marcas comerciais, marcas de serviço e logótipos neles contidos (as "Marcas"). O nosso Conteúdo e Marcas estão protegidos por leis de direitos de autor e marcas comerciais (e várias outras leis de direitos de propriedade intelectual e de concorrência desleal) e tratados em todo o mundo. O Conteúdo e as Marcas são fornecidos nos ou através dos Serviços "COMO ESTÃO" apenas para sua utilização pessoal, não comercial ou para fins comerciais internos.</p>
                        <p><strong>A sua utilização dos nossos Serviços:</strong> Sujeito ao cumprimento destes Termos Legais, incluindo a secção "ATIVIDADES PROIBIDAS" abaixo, concedemos-lhe uma licença não exclusiva, não transferível e revogável para aceder aos Serviços; e descarregar ou imprimir uma cópia de qualquer parte do Conteúdo a que tenha obtido acesso adequado, apenas para sua utilização pessoal, não comercial ou para fins comerciais internos.</p>
                        <p><strong>As suas submissões:</strong> Ao enviar-nos diretamente qualquer pergunta, comentário, sugestão, ideia, feedback ou outra informação sobre os Serviços ("Submissões"), concorda em ceder-nos todos os direitos de propriedade intelectual sobre essa Submissão.</p>
                    </div>
                </div>

                <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 md:p-8 mb-8 transition-all hover:bg-stone-50">
                    <h2 className="text-2xl font-black text-[#1CB0F6] mb-4">3. Declarações do Utilizador</h2>
                    <div className="space-y-4 text-lg text-stone-600 leading-relaxed font-medium">
                        <p>Ao utilizar os Serviços, declara e garante que: (1) tem capacidade legal e concorda em cumprir estes Termos Legais; (2) não é menor na jurisdição onde reside; (3) não acederá aos Serviços através de meios automatizados ou não humanos, seja através de robô, script ou de outra forma; (4) não utilizará os Serviços para qualquer fim ilegal ou não autorizado; e (5) a sua utilização dos Serviços não violará qualquer lei ou regulamento aplicável.</p>
                        <p>Se fornecer qualquer informação que seja falsa, inexata, desatualizada ou incompleta, temos o direito de suspender ou rescindir a sua conta e recusar qualquer utilização atual ou futura dos Serviços (ou de qualquer parte deles).</p>
                    </div>
                </div>

                <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 md:p-8 mb-8 transition-all hover:bg-stone-50">
                    <h2 className="text-2xl font-black text-[#1CB0F6] mb-4">4. Atividades Proibidas</h2>
                    <div className="space-y-4 text-lg text-stone-600 leading-relaxed font-medium">
                        <p>Não pode aceder ou utilizar os Serviços para qualquer outra finalidade que não aquela para a qual disponibilizamos os Serviços. Os Serviços não podem ser utilizados em conexão com quaisquer empreendimentos comerciais, exceto aqueles que sejam especificamente endossados ou aprovados por nós.</p>
                        <p>Como utilizador dos Serviços, concorda em não:</p>
                        <ul className="list-disc pl-6 space-y-2 marker:text-stone-300">
                            <li>Extrair sistematicamente dados ou outro conteúdo dos Serviços.</li>
                            <li>Enganar, fraudar ou iludir-nos a nós e a outros utilizadores.</li>
                            <li>Contornar, desativar ou interferir de outra forma com funcionalidades relacionadas com a segurança dos Serviços.</li>
                            <li>Depreciar, manchar ou, de outra forma, prejudicar, na nossa opinião, nós e/ou os Serviços.</li>
                            <li>Utilizar qualquer informação obtida dos Serviços para assediar, abusar ou prejudicar outra pessoa.</li>
                            <li>Utilizar os Serviços de forma incompatível com quaisquer leis ou regulamentos aplicáveis.</li>
                            <li>Carregar ou transmitir vírus, cavalos de Troia ou outro material que interfira com a utilização dos Serviços.</li>
                            <li>Envolver-se em qualquer utilização automatizada do sistema, como usar scripts para enviar comentários ou mensagens, ou usar qualquer mineração de dados, robôs ou ferramentas semelhantes.</li>
                        </ul>
                    </div>
                </div>

                <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 md:p-8 mb-8 transition-all hover:bg-stone-50">
                    <h2 className="text-2xl font-black text-[#1CB0F6] mb-4">5 & 6. Contribuições e Licença</h2>
                    <div className="space-y-4 text-lg text-stone-600 leading-relaxed font-medium">
                        <p>Os Serviços não oferecem aos utilizadores a possibilidade de enviar ou publicar conteúdo. Podemos dar-lhe a oportunidade de criar, submeter, publicar, exibir, transmitir conteúdo e materiais para nós ("Contribuições").</p>
                        <p>Você e os Serviços concordam que podemos aceder, armazenar, processar e utilizar quaisquer informações e dados pessoais que forneça e as suas escolhas. Não reivindicamos qualquer propriedade sobre as suas Contribuições.</p>
                    </div>
                </div>

                <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 md:p-8 mb-8 transition-all hover:bg-stone-50">
                    <h2 className="text-2xl font-black text-[#1CB0F6] mb-4">7. Gestão dos Serviços</h2>
                    <div className="space-y-4 text-lg text-stone-600 leading-relaxed font-medium">
                        <p>Reservamo-nos o direito, mas não a obrigação, de: (1) monitorizar os Serviços para detetar violações destes Termos Legais; (2) tomar as medidas legais adequadas contra qualquer pessoa que, a nosso exclusivo critério, viole a lei ou estes Termos Legais; (3) recusar, restringir o acesso a, limitar a disponibilidade de qualquer uma das suas Contribuições.</p>
                    </div>
                </div>

                <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 md:p-8 mb-8 transition-all hover:bg-stone-50">
                    <h2 className="text-2xl font-black text-[#1CB0F6] mb-4">8. Prazo e Rescisão</h2>
                    <div className="space-y-4 text-lg text-stone-600 leading-relaxed font-medium">
                        <p>Estes Termos Legais permanecerão em pleno vigor e efeito enquanto utilizar os Serviços. RESERVAMO-NOS O DIREITO, A NOSSO EXCLUSIVO CRITÉRIO E SEM AVISO, DE NEGAR ACESSO E UTILIZAÇÃO DOS SERVIÇOS A QUALQUER PESSOA POR QUALQUER RAZÃO.</p>
                    </div>
                </div>

                <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 md:p-8 mb-8 transition-all hover:bg-stone-50">
                    <h2 className="text-2xl font-black text-[#1CB0F6] mb-4">9. Modificações e Interrupções</h2>
                    <div className="space-y-4 text-lg text-stone-600 leading-relaxed font-medium">
                        <p>Reservamo-nos o direito de alterar, modificar ou remover o conteúdo dos Serviços a qualquer momento ou por qualquer motivo, a nosso exclusivo critério e sem aviso prévio. Não podemos garantir que os Serviços estarão disponíveis em todos os momentos.</p>
                    </div>
                </div>

                <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 md:p-8 mb-8 transition-all hover:bg-stone-50">
                    <h2 className="text-2xl font-black text-[#1CB0F6] mb-4">10 & 11. Lei Aplicável e Litígios</h2>
                    <div className="space-y-4 text-lg text-stone-600 leading-relaxed font-medium">
                        <p>Estes Termos Legais serão regidos e interpretados de acordo com a legislação em vigor.</p>
                        <p>Para acelerar a resolução e controlar o custo de qualquer litígio, as Partes concordam em primeiro tentar negociar qualquer Litígio informalmente por pelo menos 30 dias antes de iniciar a arbitragem.</p>
                    </div>
                </div>

                <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 md:p-8 mb-8 transition-all hover:bg-stone-50">
                    <h2 className="text-2xl font-black text-[#1CB0F6] mb-4">12 ao 15. Correções, Isenções e Indemnizações</h2>
                    <div className="space-y-4 text-lg text-stone-600 leading-relaxed font-medium">
                        <p>Pode haver informações nos Serviços que contenham erros tipográficos, imprecisões ou omissões. Reservamo-nos o direito de corrigir quaisquer erros.</p>
                        <p>OS SERVIÇOS SÃO FORNECIDOS "COMO ESTÃO" E "CONFORME DISPONÍVEIS". EM NENHUMA CIRCUNSTÂNCIA NÓS SEREMOS RESPONSÁVEIS POR QUAISQUER DANOS DIRETOS OU INDIRETOS DECORRENTES DA SUA UTILIZAÇÃO DOS SERVIÇOS.</p>
                        <p>Concorda em defender, indemnizar e nos manter indemnes de qualquer reclamação de terceiros devido ou resultante da sua utilização dos Serviços ou violação destes Termos.</p>
                    </div>
                </div>

                <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 md:p-8 mb-8 transition-all hover:bg-stone-50">
                    <h2 className="text-2xl font-black text-[#1CB0F6] mb-4">16 ao 19. Dados, Eletrónicas e Disposições Gerais</h2>
                    <div className="space-y-4 text-lg text-stone-600 leading-relaxed font-medium">
                        <p>Manteremos certos dados que transmitir aos Serviços para efeitos de gestão do desempenho dos Serviços. Visitar os Serviços e preencher formulários online constituem comunicações eletrónicas onde concorda com o uso de assinaturas e registos eletrónicos.</p>
                        <p>Estes Termos Legais e quaisquer políticas ou regras operacionais publicadas por nós constituem o acordo e entendimento total entre si e nós.</p>
                    </div>
                </div>

                <div className="mt-12 flex justify-center">
                    <Link href="/settings" className="bg-stone-200 text-stone-500 border-b-4 border-stone-300 active:translate-y-1 active:border-b-0 hover:bg-stone-300 rounded-2xl px-12 py-5 font-black uppercase tracking-widest text-center block w-full md:w-auto transition-all">
                        VOLTAR
                    </Link>
                </div>
            </div>
        </div>
    );
}
