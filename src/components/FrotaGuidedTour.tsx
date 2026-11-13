import { GuidedTour, type TourStep } from './GuidedTour';
import { SimFrotaImport, SimFrotaResult } from './FrotaSimulator';

interface FrotaGuidedTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

const STEPS: TourStep[] = [
  {
    title: 'Importar Frota',
    description:
      'Selecione a planilha XLSX da sua frota. O Otimiza Flash processará os dados e gerará o arquivo otimizado.',
    content: <SimFrotaImport />,
  },
  {
    title: 'Arquivo da Frota',
    description:
      'Após processar a planilha, o Otimiza Flash gera o arquivo otimizado. Recomendamos abrir o Circuit para enviar automaticamente seu arquivo. Use "Baixar arquivo" para salvar uma cópia no celular.',
    content: <SimFrotaResult />,
  },
];

export function FrotaGuidedTour({ onComplete, onSkip }: FrotaGuidedTourProps) {
  return <GuidedTour steps={STEPS} onComplete={onComplete} onSkip={onSkip} />;
}
