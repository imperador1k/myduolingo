import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
    title: "Aviso de Privacidade",
    description: "Consulta como a MyDuolingo protege os teus dados e gere a tua privacidade enquanto aprendes idiomas.",
    alternates: {
        canonical: "/privacy",
    },
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#fbf9f8] py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="flex flex-col items-center text-center mb-12 space-y-4">
                    <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-2xl flex items-center justify-center border-2 border-stone-200 mb-2">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-stone-700 tracking-tight">Aviso de Privacidade</h1>
                    <div className="bg-stone-200 text-stone-500 font-bold text-xs px-4 py-2 rounded-full uppercase tracking-widest mt-4">
                        Última Atualização: 7 de Abril de 2026
                    </div>
                </div>

                <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 md:p-8 mb-8 transition-all hover:bg-stone-50">
                    <h2 className="text-2xl font-black text-[#1CB0F6] mb-4">Bem-vindo</h2>
                    <div className="space-y-4 text-lg text-stone-600 leading-relaxed font-medium">
                        <p>Este Aviso de Privacidade para a nossa Empresa, descreve como e por que razão podemos aceder, recolher, armazenar, utilizar e/ou partilhar ("processar") as suas informações pessoais quando utiliza os nossos serviços ("Serviços"), incluindo quando visita o nosso website ou descarrega e utiliza a nossa aplicação móvel (MyDuolingo).</p>
                        <p>Dúvidas ou preocupações? Ler este Aviso de Privacidade ajudá-lo-á a compreender os seus direitos e opções de privacidade. Se não concordar com as nossas políticas e práticas, não utilize os nossos Serviços.</p>
                    </div>
                </div>

                <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 md:p-8 mb-8 transition-all hover:bg-stone-50">
                    <h2 className="text-2xl font-black text-[#1CB0F6] mb-4">1. Que Informações Recolhemos?</h2>
                    <div className="space-y-4 text-lg text-stone-600 leading-relaxed font-medium">
                        <p><strong>Informações pessoais fornecidas por si:</strong> Recolhemos informações pessoais que nos fornece voluntariamente quando se regista nos Serviços, manifesta interesse em obter informações sobre nós ou os nossos produtos, ou quando contacta o suporte. Estas informações incluem nomes, endereços de e-mail, nomes de utilizador e dados de autenticação. Não processamos informações sensíveis.</p>
                        <p><strong>Dados de login em redes sociais:</strong> Podemos oferecer a opção de se registar connosco utilizando detalhes de redes sociais (como Google SDK, Clerk). Se escolher registar-se desta forma, recolheremos certas informações de perfil do fornecedor.</p>
                        <p><strong>Dados da aplicação:</strong> Se utilizar a nossa aplicação, podemos solicitar acesso a notificações push para alertas de estudo ou lembretes (que podem ser desativados) e as informações essenciais para a sua segurança e registo do dispositivo.</p>
                    </div>
                </div>

                <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 md:p-8 mb-8 transition-all hover:bg-stone-50">
                    <h2 className="text-2xl font-black text-[#1CB0F6] mb-4">2 & 3. Como e Porque Processamos a Informação?</h2>
                    <div className="space-y-4 text-lg text-stone-600 leading-relaxed font-medium">
                        <p>Processamos as suas informações pessoais para facilitar a criação e autenticação de conta e para gerir contas de utilizador. Também processamos informações para prevenir danos e proteger interesses vitais.</p>
                        <p>O RGPD exige bases legais válidas em que nos baseamos para processar essas informações: Consentimento do utilizador, Obrigações Legais ou Interesses Vitais.</p>
                    </div>
                </div>

                <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 md:p-8 mb-8 transition-all hover:bg-stone-50">
                    <h2 className="text-2xl font-black text-[#1CB0F6] mb-4">4 & 5. Partilha de Dados e Terceiros</h2>
                    <div className="space-y-4 text-lg text-stone-600 leading-relaxed font-medium">
                        <p>Podemos precisar de partilhar as suas informações pessoais em situações como Transações de Negócio, ou entre os nossos Parceiros de Negócios e Afiliados para garantir o bom funcionamento da App.</p>
                        <p>A aplicação não engloba publicidade de terceiros abusiva, mas os Serviços podem conter ligações para websites online ou aplicações de terceiros subcontratados onde a segurança desses links será administrada pelos respetivos terceiros e as suas próprias Políticas.</p>
                    </div>
                </div>
                
                <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 md:p-8 mb-8 transition-all hover:bg-stone-50">
                    <h2 className="text-2xl font-black text-[#1CB0F6] mb-4">6. Cookies e Tecnologias de Rastreamento</h2>
                    <div className="space-y-4 text-lg text-stone-600 leading-relaxed font-medium">
                        <p>Podemos utilizar cookies e tecnologias de rastreamento semelhantes para recolher informações do seu aparelho enquanto interage com os Serviços (garantindo funcionalidades base como os inícios de sessão automáticos Clerk e ClerkJWT). Algumas tecnologias online ajudam-nos a prevenir cookies maliciosos, arranjar falhas na interface e guardar os seus exames/módulos atalhos.</p>
                    </div>
                </div>

                <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 md:p-8 mb-8 transition-all hover:bg-stone-50">
                    <h2 className="text-2xl font-black text-[#1CB0F6] mb-4">7. Produtos de Inteligência Artificial (Mascote)</h2>
                    <div className="space-y-4 text-lg text-stone-600 leading-relaxed font-medium">
                        <p><strong>A Inteligência Artificial "Marco":</strong> Como parte dos nossos Serviços, oferecemos produtos alimentados por IA. A sua entrada e saída com o boneco (Marco AI) gerido por Google Gemini, serão partilhadas em conformidade com Fornecedores Google Cloud AI para Análises de Texto e Correções de Idiomas.</p>
                        <p><strong>Como cancelar:</strong> Pode fechar imediatamente os painéis de Diálogo IA e nós zelamos para não gravar os rastos em tempo real a nível base de dados além das memórias vitais a corrigir para os seus erros educativos.</p>
                    </div>
                </div>

                <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 md:p-8 mb-8 transition-all hover:bg-stone-50">
                    <h2 className="text-2xl font-black text-[#1CB0F6] mb-4">8. Como Lidamos com Logins Sociais?</h2>
                    <div className="space-y-4 text-lg text-stone-600 leading-relaxed font-medium">
                        <p>Os nossos Serviços permitem a autenticação via contas sociais (como Discord e Google). Utilizaremos essas informações como nomes e fotos, apenas para simplificar as lideranças de placares semanais e os respetivos perfis.</p>
                    </div>
                </div>

                <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 md:p-8 mb-8 transition-all hover:bg-stone-50">
                    <h2 className="text-2xl font-black text-[#1CB0F6] mb-4">9 & 10. Conservação e Segurança da Informação</h2>
                    <div className="space-y-4 text-lg text-stone-600 leading-relaxed font-medium">
                        <p>Mantemos as suas informações apenas pelo tempo estritamente necessário. Quando não existir necessidade de utilizador legítimo para possuir esses dados, eles serão descartados da nossa base segura em Drizzle Postgres.</p>
                        <p>Implementamos rigorosas defesas mas, note que, mesmo protegendo na totalidade, nenhuma transmissão pela Internet é 100% livre contra cibercriminosos extremistas.</p>
                    </div>
                </div>

                <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 md:p-8 mb-8 transition-all hover:bg-stone-50">
                    <h2 className="text-2xl font-black text-[#1CB0F6] mb-4">11. Informações Relativas a Menores</h2>
                    <div className="space-y-4 text-lg text-stone-600 leading-relaxed font-medium">
                        <p>Em suma: Não recolhemos conscientemente dados de ou comercializamos para crianças com menos de 18 anos de idade.</p>
                        <p>Ao utilizar os Serviços, declara que tem pelo menos 18 anos ou que possui um familiar/tutor maior a tomar posse sobre si de toda e qualquer atividade na plataforma.</p>
                    </div>
                </div>

                <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 md:p-8 mb-8 transition-all hover:bg-stone-50">
                    <h2 className="text-2xl font-black text-[#1CB0F6] mb-4">12 ao 16. Direitos e Controlos Finais</h2>
                    <div className="space-y-4 text-lg text-stone-600 leading-relaxed font-medium">
                        <p>Na UE / EEE poderá sempre solicitar cópias ou retificações de total limpeza digital contra a rede que detém. Teremos total respeito perante as definições como o modo de "Não Rastreie" dos respetivos browsers.</p>
                        <p>Note que podemos a todo momento e instantes alertar todos os jogadores sobre proeminentes atualizações a esta via legal (14), na qual terá todo o privilégio de apagar os dados ou atualizar revisões a partir das opções Contacto e Suporte Interno do interface app (15 & 16).</p>
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
