// TEMPORARIAMENTE DESABILITADO - Aguardando nova implementação do checklist TP
// import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText } from 'lucide-react';
// import { useTPVerificacoes, type TPVerificacao } from '@/hooks/useTPVerificacoes';
// import { format } from 'date-fns';
// import { ptBR } from 'date-fns/locale';
// import TPVerificacaoDetailsModal from './TPVerificacaoDetailsModal';

const TPVerificacoesHistorico = () => {
  // TEMPORARIAMENTE DESABILITADO - Aguardando nova implementação do checklist TP
  // const { data: verificacoes = [], isLoading } = useTPVerificacoes();
  // const [filtroBase, setFiltroBase] = useState('');
  // const [filtroMes, setFiltroMes] = useState('');
  // const [filtroAno, setFiltroAno] = useState('');
  // const [verificacaoSelecionada, setVerificacaoSelecionada] = useState<TPVerificacao | null>(null);
  // const [modalAberto, setModalAberto] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Histórico de Verificações TP
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Funcionalidade Temporariamente Indisponível</h3>
          <p className="text-muted-foreground mb-4">
            O histórico de verificações TP está sendo reestruturado para uma nova implementação mais eficiente.
          </p>
          <p className="text-sm text-muted-foreground">
            Esta funcionalidade estará disponível novamente em breve.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TPVerificacoesHistorico;