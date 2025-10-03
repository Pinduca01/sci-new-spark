import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CreatedUser {
  nome: string;
  email: string;
  senha_temporaria: string;
  role: string;
  success: boolean;
}

interface ErrorUser {
  bombeiro: string;
  error: string;
}

interface CreateUsersResponse {
  success: boolean;
  message: string;
  created: number;
  failed: number;
  list: CreatedUser[];
  errors?: ErrorUser[];
}

export default function AdminCreateUsers() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CreateUsersResponse | null>(null);
  const { toast } = useToast();

  const handleCreateUsers = async () => {
    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('create-bombeiros-users', {
        body: {}
      });

      if (error) throw error;

      setResult(data);
      
      if (data.created > 0) {
        toast({
          title: "✅ Usuários criados com sucesso!",
          description: `${data.created} usuário(s) criado(s). Senha padrão: Bombeiro@2025`,
        });
      } else {
        toast({
          title: "ℹ️ Nenhum usuário pendente",
          description: data.message,
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error('Erro ao criar usuários:', error);
      toast({
        title: "❌ Erro ao criar usuários",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            Criar Usuários para Bombeiros
          </CardTitle>
          <CardDescription>
            Cria automaticamente usuários no Supabase Auth para todos os bombeiros ativos que ainda não possuem conta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              <strong>Senha padrão:</strong> Bombeiro@2025<br />
              <strong>Mapeamento de funções:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>BA-CE → role: ba_ce</li>
                <li>BA-LR → role: ba_lr</li>
                <li>BA-MC → role: ba_mc</li>
                <li>BA-2 → role: ba_2</li>
                <li>GS → role: gs_base</li>
                <li>Outros → role: ba_2 (padrão)</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Button 
            onClick={handleCreateUsers} 
            disabled={loading}
            size="lg"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando usuários...
              </>
            ) : (
              <>
                <Users className="mr-2 h-4 w-4" />
                Criar Usuários Pendentes
              </>
            )}
          </Button>

          {result && (
            <div className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-green-50 dark:bg-green-950">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Criados</p>
                        <p className="text-2xl font-bold">{result.created}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-red-50 dark:bg-red-950">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Erros</p>
                        <p className="text-2xl font-bold">{result.failed}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {result.list && result.list.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Usuários Criados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-96 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-background border-b">
                          <tr>
                            <th className="text-left p-2">Nome</th>
                            <th className="text-left p-2">Email</th>
                            <th className="text-left p-2">Role</th>
                            <th className="text-left p-2">Senha</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.list.map((user, index) => (
                            <tr key={index} className="border-b">
                              <td className="p-2">{user.nome}</td>
                              <td className="p-2 font-mono text-xs">{user.email}</td>
                              <td className="p-2">
                                <span className="px-2 py-1 rounded-full bg-primary/10 text-xs">
                                  {user.role}
                                </span>
                              </td>
                              <td className="p-2 font-mono text-xs">{user.senha_temporaria}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {result.errors && result.errors.length > 0 && (
                <Card className="border-red-200 dark:border-red-800">
                  <CardHeader>
                    <CardTitle className="text-lg text-red-600">Erros</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {result.errors.map((error, index) => (
                        <Alert key={index} variant="destructive">
                          <AlertDescription>
                            <strong>{error.bombeiro}:</strong> {error.error}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
