import { GuidedTour, type TourStep } from './GuidedTour';
import { TutorialScreenshot } from './TutorialScreenshot';
import {
  SimHomeCard,
  SimSelectXlsx,
  SimArquivoSpx,
  SimScanner,
  SimFinalizacao,
} from './FlexSimulator';

interface FlexGuidedTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

const STEPS: TourStep[] = [
  {
    title: 'Bem-vindo ao Rota 123!',
    description:
      'Vamos conhecer como preparar, otimizar e organizar suas rotas de entrega. Acompanhe o passo a passo.',
  },
  {
    title: 'Preparar Rota (Flex)',
    description:
      'Aqui você prepara sua rota de entregas de forma rápida e organizada. Toque no card para começar.',
    content: <SimHomeCard />,
  },
  {
    title: 'Selecionar XLSX',
    description:
      'Selecione a planilha XLSX baixada do aplicativo SPX. O Rota 123 processará os dados automaticamente.',
    content: <SimSelectXlsx />,
  },
  {
    title: 'Já tenho um PDF',
    description:
      'Se você já possui o PDF da rota otimizada, pode importá-lo diretamente pela segunda opção, sem precisar processar a planilha.',
    content: <SimSelectXlsx />,
  },
  {
    title: 'Arquivo da Rota',
    description:
      'Após processar a planilha, o Rota 123 gera o arquivo da rota. Recomendamos abrir o Circuit para enviar automaticamente seu arquivo e organizar e otimizar sua rota. Use "Baixar arquivo" para salvar uma cópia no celular, ou "Continuar" se já tiver o PDF da rota.',
    content: <SimArquivoSpx />,
  },
  {
    title: 'Organizando e imprimindo sua rota no Circuit',
    description:
      'Otimize sua rota no Circuit. Depois, toque nos três pontinhos ao lado de "Toque para adicionar" e selecione "Imprimir rota".',
    hideDescription: true,
    content: (
      <TutorialScreenshot
        large
        src="/tutorial/inicio-dois.png"
        alt="Circuit: três pontinhos ao lado de Toque para adicionar e a opção Imprimir rota"
      />
    ),
  },
  {
    title: 'Selecionando a impressora Rota 123',
    description:
      'Por padrão, aparece "Salvar como PDF". Toque nessa opção, selecione "Rota 123 — Importar PDF" e depois toque no botão de impressão para enviar sua rota.',
    hideDescription: true,
    content: (
      <TutorialScreenshot
        large
        src="/tutorial/impressora.png"
        alt="Tela de impressão com a opção Rota 123 — Importar PDF selecionada"
      />
    ),
  },
  {
    title: 'Rota recebida! Agora é só bipar.',
    description:
      'Após enviar a rota pela impressora virtual, você receberá uma notificação do Rota 123. Toque nela para abrir automaticamente a tela de bipagem da sua rota.',
    hideDescription: true,
    content: (
      <TutorialScreenshot
        large
        src="/tutorial/rota-recebida.png"
        alt="Notificação do Rota 123 informando que a rota foi recebida"
      />
    ),
  },
  {
    title: 'Bipagem',
    description:
      'Aqui você utiliza a câmera para ler os códigos dos pacotes e organizar sua sequência de entregas.',
    content: <SimScanner />,
  },
  {
    title: 'Finalização',
    description:
      'Pronto! Agora você já conhece o processo de preparação de rotas no Rota 123. Bom trabalho!',
    content: <SimFinalizacao />,
  },
];

export function FlexGuidedTour({ onComplete, onSkip }: FlexGuidedTourProps) {
  return <GuidedTour steps={STEPS} onComplete={onComplete} onSkip={onSkip} />;
}
