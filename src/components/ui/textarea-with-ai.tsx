import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Check, X, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface TextareaWithAIProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onValueChange?: (value: string) => void;
}

const TextareaWithAI = React.forwardRef<HTMLTextAreaElement, TextareaWithAIProps>(
  ({ className, onValueChange, value, onChange, ...props }, ref) => {
    const [isChecking, setIsChecking] = useState(false);
    const [suggestion, setSuggestion] = useState<string | null>(null);
    const [showComparison, setShowComparison] = useState(false);
    const [originalText, setOriginalText] = useState("");

    const handleGrammarCheck = async () => {
      const currentText = value?.toString() || "";
      
      if (!currentText.trim()) {
        toast({
          title: "Texto vazio",
          description: "Digite algum texto antes de corrigir a gramática.",
          variant: "destructive",
        });
        return;
      }

      if (currentText.length < 10) {
        toast({
          title: "Texto muito curto",
          description: "Digite pelo menos 10 caracteres para a correção ser útil.",
          variant: "destructive",
        });
        return;
      }

      setIsChecking(true);
      setOriginalText(currentText);

      try {
        const { data, error } = await supabase.functions.invoke('grammar-checker', {
          body: { texto: currentText }
        });

        if (error) throw error;

        if (data.erro) {
          throw new Error(data.erro);
        }

        if (!data.alterado) {
          toast({
            title: "✨ Texto perfeito!",
            description: "Nenhuma correção necessária. Sua gramática está excelente!",
          });
          return;
        }

        setSuggestion(data.textoCorrigido);
        setShowComparison(true);
        
        toast({
          title: "Correções sugeridas",
          description: "Revise as alterações propostas e escolha aceitar ou rejeitar.",
        });

      } catch (error) {
        console.error('Erro ao corrigir gramática:', error);
        toast({
          title: "Erro na correção",
          description: error.message || "Não foi possível corrigir a gramática. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsChecking(false);
      }
    };

    const acceptSuggestion = () => {
      if (suggestion) {
        const event = {
          target: { value: suggestion }
        } as React.ChangeEvent<HTMLTextAreaElement>;
        
        onChange?.(event);
        onValueChange?.(suggestion);
        
        toast({
          title: "✅ Correções aplicadas",
          description: "O texto foi atualizado com as correções sugeridas.",
        });
      }
      
      resetSuggestion();
    };

    const rejectSuggestion = () => {
      toast({
        title: "Correções rejeitadas",
        description: "O texto original foi mantido.",
      });
      resetSuggestion();
    };

    const resetSuggestion = () => {
      setSuggestion(null);
      setShowComparison(false);
      setOriginalText("");
    };

    const renderComparison = () => {
      if (!showComparison || !suggestion) return null;

      return (
        <div className="mt-3 space-y-3 border rounded-lg p-3 bg-secondary/10">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Correções Sugeridas
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComparison(!showComparison)}
              className="h-6 px-2"
            >
              {showComparison ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </Button>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <label className="font-medium text-muted-foreground">Original:</label>
              <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded text-red-800 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-200">
                {originalText}
              </div>
            </div>
            
            <div>
              <label className="font-medium text-muted-foreground">Sugerido:</label>
              <div className="mt-1 p-2 bg-green-50 border border-green-200 rounded text-green-800 dark:bg-green-950/20 dark:border-green-900/30 dark:text-green-200">
                {suggestion}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={acceptSuggestion}
              size="sm"
              className="h-8 text-xs"
            >
              <Check className="w-3 h-3 mr-1" />
              Aceitar
            </Button>
            <Button
              onClick={rejectSuggestion}
              variant="outline"
              size="sm"
              className="h-8 text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              Rejeitar
            </Button>
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-2">
        <div className="relative">
          <Textarea
            className={cn(className)}
            ref={ref}
            value={value}
            onChange={onChange}
            {...props}
          />
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleGrammarCheck}
            disabled={isChecking}
            className="absolute top-2 right-2 h-8 px-2 text-xs bg-background/80 hover:bg-background/90 border border-border/50"
          >
            {isChecking ? (
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
            ) : (
              <Sparkles className="w-3 h-3 mr-1" />
            )}
            {isChecking ? "Corrigindo..." : "Corrigir IA"}
          </Button>
        </div>

        {renderComparison()}
      </div>
    );
  }
);

TextareaWithAI.displayName = "TextareaWithAI";

export { TextareaWithAI };