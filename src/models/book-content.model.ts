
export interface Book {
  topic: string;
  chapters: Chapter[];
}

export interface Chapter {
  title: string;
  body: string;
  comic: Comic;
  caseStudies?: CaseStudy[];
  chart?: Chart;
}

export interface Comic {
  panelCount: number;
  typography: string;
  panelDescriptions: string[];
  layout: string;
  layoutRationale: string;
}

export interface CaseStudy {
  name: string;
  archetype: string;
  story: string;
  financialAutopsy: string;
  zinger: string;
  caricaturePrompt: string;
  visualElement: {
    type: string;
    title: string;
    content: string;
    guruName?: string;
  };
}

export interface Chart {
  title:string;
  prompt: string;
}
