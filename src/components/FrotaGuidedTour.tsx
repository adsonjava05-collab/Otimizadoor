import { GuidedTour, type TourStep } from './GuidedTour';
import { TutorialScreenshot } from './TutorialScreenshot';
import {
  SimFrotaHomeCard,
  SimFrotaImport,
  SimFrotaResult,
} from './FrotaSimulator';

interface FrotaGuidedTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

const STEPS: TourStep[] = [
  {
    title: 'Otimizar Frota',
    description:
      'Vamos conhecer como otimizar sua frota de entregas. Acompanhe o passo a passo.',
    content: <SimFrotaHomeCard />,
  },
  {
    title: 'Importar Frota',
    description:
      'Selecione a planilha XLSX da sua frota. O Rota 123 processará os dados, unificará endereços repetidos e gerará o arquivo otimizado.',
    content: <SimFrotaImport />,
  },
  {
    title: 'Arquivo da Frota',
    description:
      'Após processar a planilha, o Rota 123 gera o arquivo otimizado. Recomendamos abrir o Circuit para enviar automaticamente seu arquivo. Use "Baixar arquivo" para salvar uma cópia no celular.',
    content: <SimFrotaResult />,
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
];

export function FrotaGuidedTour({ onComplete, onSkip }: FrotaGuidedTourProps) {
  return <GuidedTour steps={STEPS} onComplete={onComplete} onSkip={onSkip} />;
}
