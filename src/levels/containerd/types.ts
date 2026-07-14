export type BlockType =
  | 'text'
  | 'callout'
  | 'commands'
  | 'terminal'
  | 'table'
  | 'steps'
  | 'diagram'
  | 'cards'
  | 'compare'
  | 'list'
  | 'code'
  | 'tree'
  | 'checklist'
  | 'demo';

export interface TextBlock {
  type: 'text';
  title?: string;
  body: string;
  highlight?: string;
}

export interface CalloutBlock {
  type: 'callout';
  variant: 'info' | 'warn' | 'success' | 'tip' | 'danger';
  title: string;
  body: string;
}

export interface CommandItem {
  cmd: string;
  note?: string;
  out?: string;
}

export interface CommandsBlock {
  type: 'commands';
  title?: string;
  items: CommandItem[];
}

export interface TerminalBlock {
  type: 'terminal';
  title?: string;
  lines: string[];
}

export interface TableBlock {
  type: 'table';
  title?: string;
  headers: string[];
  rows: string[][];
}

export interface StepsBlock {
  type: 'steps';
  title?: string;
  steps: { title: string; detail: string; cmd?: string }[];
}

export interface DiagramBlock {
  type: 'diagram';
  title?: string;
  lines: string[];
}

export interface CardsBlock {
  type: 'cards';
  title?: string;
  items: { title: string; body: string; tag?: string; color?: string }[];
}

export interface CompareBlock {
  type: 'compare';
  title?: string;
  left: { title: string; items: string[] };
  right: { title: string; items: string[] };
}

export interface ListBlock {
  type: 'list';
  title?: string;
  ordered?: boolean;
  items: string[];
}

export interface CodeBlock {
  type: 'code';
  title?: string;
  lang?: string;
  code: string;
}

export interface TreeBlock {
  type: 'tree';
  title?: string;
  lines: string[];
}

export interface ChecklistBlock {
  type: 'checklist';
  title?: string;
  items: { label: string; ok?: boolean }[];
}

export interface DemoBlock {
  type: 'demo';
  demoId: string;
}

export type ContentBlock =
  | TextBlock
  | CalloutBlock
  | CommandsBlock
  | TerminalBlock
  | TableBlock
  | StepsBlock
  | DiagramBlock
  | CardsBlock
  | CompareBlock
  | ListBlock
  | CodeBlock
  | TreeBlock
  | ChecklistBlock
  | DemoBlock;

export interface Lesson {
  id: string;
  title: string;
  subtitle?: string;
  blocks: ContentBlock[];

}

export interface Module {
  id: string;
  part: string;
  title: string;
  short: string;
  icon: string;
  lessons: Lesson[];
}
