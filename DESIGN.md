# Design system — Ink & Paper

Versão: 1.0 · Plataforma: React Native · Produto: tarefas com Pomodoro.
Status: contrato visual proposto para o repositório. A implementação e a renderização em dispositivos ainda precisam ser verificadas.

## 1. Autoridade e uso por agentes

Este documento centraliza as decisões do produto. Antes de alterar uma tela, consulte-o e reutilize os componentes existentes. Não invente um novo contorno, cor ou estilo de texto para resolver um problema local.

Ordem para resolver divergências:
1. Instrução explícita atual do responsável pelo projeto.
2. Este contrato e os tokens sincronizados no código.
3. Vetores aprovados e versionados no repositório.
4. Figma, como referência visual para a mesma versão do contrato.
5. Referências exploratórias do Stitch e documentação de bibliotecas.

Se código, vetores e contrato divergirem, registre a diferença antes de mudar a referência. Uma captura nova ou uma geração automática não aprova uma mudança visual.

Referências de origem, sem pressupor sincronização automática:
- Componentes: https://www.figma.com/design/qinnQ7368IU0D82YWdvBaG?node-id=51-299
- Board: https://www.figma.com/design/qinnQ7368IU0D82YWdvBaG?node-id=2-86

Os arquivos de entrada `design.md` e `DESIGN(1).md` são referências históricas. O primeiro descreve Drawably para DOM/React web; não é um contrato de implementação React Native. O segundo contém uma exploração de estilo do Stitch. As regras consolidadas abaixo substituem suas decisões conflitantes para este produto.

## 2. Identidade

Papel quente, tinta escura, curvas discretas e conteúdo alinhado. A irregularidade pertence à decoração vetorial. Textos, controles e áreas de toque mantêm geometria normal.

Regras invariantes:
- Contornos determinísticos, estáveis entre montagens e atualizações do timer.
- Silhueta preta sólida atrás do papel, deslocada 3 dp em X e 4 dp em Y.
- Borda estrutural de 2 dp, independente das dimensões do card.
- Sem animação contínua de traços, sorteio por montagem ou redefinição de curvas por tela.
- Sem rotação ou inclinação de contêineres que deformem conteúdo.
- Azul identifica ação ou seleção; amarelo destaca foco ou prioridade alta. Ambos precisam de texto ou símbolo complementar.
- Textos da interface em português.

## 3. Tokens canônicos

Unidades de layout são dp; tamanhos de texto usam unidades lógicas do React Native e respeitam a escala de fonte do sistema. Os números não são pixels físicos. As medidas de Figma são a referência em escala de layout 1:1.

O JSON abaixo é válido e pode ser extraído para `src/design-system/tokens.json`. Caso seja extraído, atualize este bloco e o arquivo na mesma alteração até adotar um gerador único. Não mantenha cópias divergentes.

```json
{
  "version": "1.0.0",
  "colors": {
    "canvas": "#F8F5EE",
    "paper": "#FFFDF9",
    "paperHeader": "#F4EFE6",
    "ink": "#222020",
    "shadow": "#000000",
    "textSecondary": "#66615C",
    "divider": "#D8D2C7",
    "accent": "#2339D6",
    "highlight": "#FFF59D",
    "priorityHigh": "#FFE54D",
    "success": "#15793E",
    "danger": "#BA1A1A",
    "onDark": "#FFFDF9"
  },
  "spacing": { "xs": 4, "sm": 8, "md": 12, "lg": 16, "xl": 24, "xxl": 32 },
  "card": {
    "referenceWidth": 350,
    "focusReferenceMinHeight": 321,
    "padding": 22,
    "sectionGap": 16,
    "strokeWidth": 2,
    "shadowOffsetX": 3,
    "shadowOffsetY": 4,
    "outerBleed": 6,
    "maxLocalDeviation": 3
  },
  "control": {
    "minTouchSize": 48,
    "iconSize": 20,
    "circularVisualSize": 44,
    "buttonMinHeight": 48,
    "fieldMinHeight": 48,
    "textareaMinHeight": 96,
    "gap": 8,
    "simpleRadius": 8
  },
  "divider": { "width": 1, "dash": 4, "gap": 4 },
  "motion": { "pressMs": 100, "expandMs": 180, "pressTranslateY": 1 },
  "typography": {
    "screenTitle": { "family": "Caveat", "weight": "700", "size": 36, "lineHeight": 44 },
    "cardTitle": { "family": "Caveat", "weight": "700", "size": 26, "lineHeight": 32 },
    "timer": { "family": "Caveat", "weight": "700", "size": 64, "lineHeight": 68 },
    "handwrittenAction": { "family": "Caveat", "weight": "700", "size": 24, "lineHeight": 30 },
    "body": { "family": "Patrick Hand", "weight": "400", "size": 18, "lineHeight": 24 },
    "support": { "family": "Patrick Hand", "weight": "400", "size": 16, "lineHeight": 22 },
    "caption": { "family": "Patrick Hand", "weight": "400", "size": 13, "lineHeight": 18 },
    "label": { "family": "Inter", "weight": "600", "size": 14, "lineHeight": 20 },
    "control": { "family": "Inter", "weight": "600", "size": 14, "lineHeight": 20 },
    "input": { "family": "Patrick Hand", "weight": "400", "size": 18, "lineHeight": 26 }
  }
}
```

`maxLocalDeviation` limita a ondulação adicional de segmentos centrais. Não autoriza reconstruir ou limitar automaticamente a assimetria do vetor aprovado. Os tokens `paperHeader`, `priorityHigh` e de controles consolidam a composição TaskSetup; comparar com a referência ao implementá-los.

Use `divider` apenas em linhas decorativas. Rótulos e placeholders usam `textSecondary`, nunca a cor do divisor. Amarelo recebe texto escuro; texto claro fica sobre tinta escura ou outra cor cujo contraste tenha sido verificado. Não use opacidade global em seções para simular texto secundário.

## 4. Fontes

Versione os arquivos das fontes e suas licenças conforme a licença de cada distribuição. Carregue Caveat Bold, Patrick Hand Regular e Inter SemiBold antes de renderizar referências visuais ou medir conteúdo definitivo.

O adaptador de fontes mapeia família/peso lógico para os nomes efetivamente carregados no projeto. Não dependa de peso sintetizado ou de download remoto durante a sessão. Falha de carregamento deve ser tratada explicitamente; uma fonte de fallback não aprova a comparação visual.

Caveat é usada em títulos, números de foco e ações de destaque. Patrick Hand é usada em conteúdo manuscrito e apoio. Inter é usada em rótulos e controles operacionais. Anotações e subtarefas precisam continuar legíveis com texto longo e acentos.

O campo do timer reserva largura suficiente para `00:00` a `99:59`, centralizada. Não presuma suporte a números tabulares em Caveat. Meça e verifique sequências largas e estreitas sem deslocar os controles. Em fonte ampliada, permita que o layout cresça.

## 5. Geometria do papel

### Fonte do contorno

Exporte os vetores aprovados do Figma e versione-os como assets de origem, com um identificador de perfil e dimensões de referência. A existência desses exports ainda deve ser confirmada no repositório. Este documento não contém um SVG extraído ou uma geometria adaptativa já validada.

O perfil de forma é independente do conteúdo e do estado. `Expanded` não é nome de perfil geométrico. Não derive o papel recolhido comprimindo todo o vetor de um painel alto.

### Camadas

1. Silhueta: mesmo caminho final do papel, preto opaco, offset +3/+4.
2. Papel: preenchimento `paper`, contorno `ink` de 2 dp.
3. Conteúdo: layout nativo, com padding de 22 dp e gap de 16 dp.

O SVG é decorativo e não recebe toques nem foco de acessibilidade. O componente reserva 6 dp externos para borda e sombra; esse espaço não faz parte do padding interno. Ancestrais não devem recortar essa área.

### Adaptação

Mantenha as regiões dos cantos em unidades fixas. Ajuste a extensão dos segmentos centrais a partir da largura e da altura medidas. Preserve continuidade das tangentes, sem degraus, pontas ou saliências nas junções. Documente os pontos de ancoragem do perfil após aprovar sua implementação.

Recalcule a geometria somente quando dimensão ou perfil mudar. A atualização de segundos e a troca de texto sem mudança dimensional não alteram o caminho. A silhueta usa o mesmo resultado de geometria que o papel.

Não use `preserveAspectRatio="none"` como solução de redimensionamento do vetor completo. Não substitua o papel por `borderRadius`. Não use geração aleatória de curvas durante renderizações.

Para perfis ainda não aprovados, reutilize um perfil validado ou crie uma proposta identificada para revisão. Não publique uma aproximação como se fosse o vetor de referência.

O fundo do cabeçalho acompanha o contorno por máscara ou recorte da camada decorativa. O recorte não pode atingir a sombra externa nem controles. Evite adicionar uma segunda borda retangular ao cabeçalho.

## 6. Componentes e composição

| Componente | Responsabilidade | Estados/propriedades |
|---|---|---|
| PaperSurface | Papel, contorno e silhueta | profile, dimensões medidas |
| SketchCard | Área interna, composição e espaço externo | children, contentStyle, layout externo |
| FocusTaskCard | Tarefa com timer e progresso | presentation: default/collapsed/expanded; session: idle/running/paused/break/finished |
| TaskSetup | Opções da criação de tarefa | expanded, estimativa, prazo, prioridade, subtarefas, notas, alerta |
| SketchButton | Ação textual | solid/outline; idle/pressed/disabled/loading |
| SketchIconButton | Ação por ícone | idle/pressed/disabled; rótulo acessível obrigatório |
| SketchCheckbox | Conclusão individual | checked/unchecked/disabled |
| PrioritySelector | Escolha única | low/medium/high |
| SketchTextField | Entrada simples | default/focused/error/disabled |
| SketchTextArea | Entrada multilinha | default/focused/error/disabled |
| SketchSwitch | Opção booleana | on/off/disabled |
| SketchDivider | Separação decorativa | token padrão |

Os nomes são o contrato proposto; respeite a organização existente do repo ao implementá-los. Componentes de tela não redesenham a superfície. Controles reutilizáveis têm seus próprios estados, evitando uma combinação de variantes do card para cada seleção de prioridade ou checkbox.

### FocusTaskCard

`default`: título, tempo, controles e progresso. Referência de 350 × 321 dp com altura mínima, não altura fixa. `collapsed`: resumo compacto. `expanded`: conteúdo adicional do plano de sessões. Apresentação e estado da sessão são eixos distintos.

O fim do bloco registra uma sessão. A meta estimada não conclui a tarefa. Concluir tarefa, concluir subtarefa e terminar foco são eventos separados. Apenas uma sessão pode estar ativa por vez; a política de troca deve ser explícita na interface.

### TaskSetup

`collapsed`: apenas cabeçalho com “Mais opções”, selo “AVANÇADO”, ação “Configurar” e chevron para baixo.

`expanded`: cabeçalho com chevron para cima e, nesta ordem:
1. Sessões estimadas: texto de apoio e controle menos/quantidade/mais; mínimo de uma sessão.
2. Prazo: “Sem prazo” e ação “Definir prazo”; prazo opcional.
3. Prioridade: Baixa, Média e Alta; uma seleção por vez, com texto/símbolo e cor.
4. Subtarefas: contador, checkboxes, títulos, remoção e adição; zero ou mais itens.
5. Anotações livres: campo multilinha com pauta decorativa; anotações são separadas das subtarefas.
6. Alerta ao terminar: sino, descrição e interruptor.

O exemplo visual pode usar 4 sessões, duas subtarefas, Alta e alerta ativo. Esses dados não definem os valores padrão de negócio. Recolher preserva valores e elimina a altura do corpo oculto. No React Native, valores devem ficar no estado do formulário e não apenas nos filhos desmontados. O contador deriva da lista.

### Controles

Ação principal: preenchimento `ink`, texto `onDark`. Ação secundária: papel e contorno. Não use azul como preenchimento padrão de todas as ações. Prioridade alta usa `priorityHigh`; marca-texto do timer usa `highlight`.

Controles circulares têm 44 dp visuais dentro de área interativa mínima de 48 × 48 dp. Não sobreponha áreas de toque vizinhas. Campo inválido recebe indicação textual e semântica, além da cor. Os estados de foco e pressionado devem ser visíveis sem redesenhar o contorno aleatoriamente.

## 7. Layout e movimento

A largura de 350 dp é referência de comparação, não largura fixa para todos os dispositivos. Use largura disponível, margens de tela de 20 dp e safe area do sistema. Formulários em telas estreitas têm rolagem vertical e acomodam o teclado.

Use flex para alinhar conteúdo e permita crescimento vertical. Posicionamento absoluto é reservado a decoração e sobreposições justificadas. Texto com quebra não depende de altura fixa. O selo e as ações do cabeçalho podem exigir reflow em fonte ampliada; não reduza a fonte automaticamente para manter uma única linha.

Animação de pressionar pode deslocar 1 dp por 100 ms. Expansão pode usar 180 ms, mantendo o conteúdo e a geometria sincronizados. Sem animação contínua do papel, cintilação de bordas ou resorteio de traços. Respeite a preferência de movimento reduzido.

A textura pontilhada fica no canvas, com baixo destaque. Ela não atravessa os campos ou prejudica o texto. Use asset ou padrão centralizado; não gere milhares de elementos de layout por tela.

## 8. Acessibilidade

- Área de toque mínima de 48 dp, inclusive remover subtarefa e controles de quantidade.
- Papéis, rótulos, valor e estado acessíveis nos controles nativos.
- Cabeçalho expansível informa expanded/collapsed ao leitor de tela.
- Corpo recolhido fica fora da navegação de acessibilidade.
- Ícones, prioridade e progresso não dependem somente de cor.
- Texto normal deve atingir contraste de 4,5:1; elementos interativos e indicadores essenciais, 3:1. Verificar combinações finais; esta especificação não certifica todas as telas.
- O timer não anuncia cada segundo ao leitor de tela; anuncia mudanças de sessão e oferece leitura do tempo sob demanda.
- Escala de fonte, teclado e ordem de foco fazem parte da validação.

## 9. Estrutura sugerida no repo

```text
DESIGN.md
src/design-system/
  tokens.json
  theme.ts
  typography.ts
  geometry/
    paperProfiles.ts
    createPaperPath.ts
  assets/
    paper/       # SVGs aprovados e metadados de origem
    fonts/       # fontes locais e licenças
  primitives/
    PaperSurface.tsx
    SketchText.tsx
    SketchButton.tsx
    SketchIconButton.tsx
    SketchCheckbox.tsx
    SketchSwitch.tsx
    SketchTextField.tsx
    SketchTextArea.tsx
    SketchDivider.tsx
  components/
    FocusTaskCard.tsx
    TaskSetup.tsx
  preview/
    DesignSystemPreview.tsx
```

Esta árvore é uma proposta de destino, não um inventário de arquivos já criados. Use TypeScript e `react-native-svg` no adaptador nativo. Não copie imports de `drawably/react`, CSS, seletores DOM ou elementos HTML para o projeto nativo. Uma futura versão web pode ter um adaptador separado que consuma os mesmos tokens.

Em `onLayout`, atualize as dimensões somente quando mudarem e evite ciclos de medição. Não fixe a altura do conteúdo para estabilizar o desenho. O renderer decorativo acompanha o layout.

## 10. Aprovação visual e testes

A primeira implementação precisa de uma tela de referência com instâncias reais dos componentes. Comparar com o Figma na mesma largura de layout e com fontes carregadas. Capturas do app são evidência; descrição textual de que “parece correto” não basta.

Matriz mínima:
- Larguras de viewport 320, 390 e 430 dp; largura do card deriva das margens.
- FocusTaskCard de referência a 350 dp, título de duas linhas e conteúdo alto.
- TaskSetup recolhido e aberto, zero/duas/cinco subtarefas e subtarefa de duas linhas.
- Fonte padrão e ampliada, teclado aberto, alerta on/off e campo em erro.
- Timer com dígitos largos/estreitos, pausado e em execução.

Critérios: nada cortado ou sobreposto; sombras visíveis; conteúdo alinhado; borda e offset constantes; ausência de saliências novas; continuidade das curvas; mudança de segundos sem mudança de desenho; valores preservados após recolher; toques e acessibilidade utilizáveis.

Use testes unitários para riscos concretos: caminho determinístico e finito, dimensões mínimas, offsets da silhueta, persistência dos valores ao recolher e seleção exclusiva da prioridade. Evite testes que apenas repitam cada valor de token. Capturas comparativas devem usar dados estáveis e movimento desativado. Aprovação inicial precisa de revisão humana; não invente uma tolerância numérica de comparação sem calibrá-la.

Validar Android e iOS quando ambos forem alvos. Registre plataforma não executada como pendente. Uma captura do Figma não prova funcionamento no app.

## 11. Processo de mudança

Toda mudança visual inclui propósito, tokens/perfis afetados, atualização da documentação e uma comparação antes/depois quando aplicável. Mudança de geometria requer nova revisão. Alteração de texto ou timer não deve mudar perfil ou seed.

Renomear perfil, propriedade ou token público exige registrar migração. Atualize o Figma correspondente quando aprovar uma alteração de contrato. Não mantenha um segundo arquivo DESIGN conflitante ativo na raiz.

Checklist para agentes:
1. Ler DESIGN.md e inspecionar componentes/tokens disponíveis.
2. Reutilizar superfícies e controles existentes.
3. Implementar apenas o escopo pedido.
4. Comparar referências e resolver desvios no componente compartilhado.
5. Informar o que foi executado, plataforma, pendências e evidência.

## 12. Pendências para adoção

- Confirmar estrutura, bibliotecas e fontes reais do repo, que não foi fornecido nesta solicitação.
- Exportar e aprovar os SVGs e metadados geométricos; não usar imagens raster como superfície interativa.
- Implementar e aprovar a adaptação dos perfis para alturas curtas e longas.
- Materializar tokens e adaptadores a partir deste contrato.
- Conferir contraste, fonte ampliada e renderização nos dispositivos-alvo.

Documento consolidado a partir dos anexos e das decisões desta conversa. Nenhuma integração ao repositório, instalação de dependência ou alteração no Figma foi executada para produzir este arquivo.