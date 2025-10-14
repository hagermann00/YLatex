
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService } from './services/gemini.service';
import { Book, Chapter, CaseStudy } from './models/book-content.model';
import { LatexPreviewComponent } from './components/latex-preview/latex-preview.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, LatexPreviewComponent]
})
export class AppComponent {
  private geminiService = inject(GeminiService);

  topic = signal<string>('Dropshipping');
  isLoading = signal<boolean>(false);
  progressMessage = signal<string>('');
  error = signal<string | null>(null);
  generatedContent = signal<Book | null>(null);
  generatedLatex = signal<string>('');

  updateTopic(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.topic.set(input.value);
  }

  async generateBook(): Promise<void> {
    if (!this.topic() || this.isLoading()) return;

    this.isLoading.set(true);
    this.error.set(null);
    this.generatedContent.set(null);
    this.generatedLatex.set('');

    try {
      const bookContent = await this.geminiService.generateBookContent(
        this.topic(),
        (message: string) => this.progressMessage.set(message)
      );
      this.generatedContent.set(bookContent);

      try {
        const latex = this.assembleLatex(bookContent);
        this.generatedLatex.set(latex);
      } catch (assemblyError) {
        console.error('LaTeX Assembly failed:', assemblyError);
        // Do not set the main error signal. The preview component will show a local error.
        // The user can still download the JSON/Markdown content.
      }

    } catch (err) {
      console.error('Generation failed:', err);
      this.error.set('An error occurred during content generation. Please check the console for details.');
    } finally {
      this.isLoading.set(false);
      this.progressMessage.set('');
    }
  }

  private assembleLatex(book: Book): string {
    const chapterLatex = book.chapters.map((chapter, index) => this.createChapterLatex(chapter, index + 1)).join('\\n\\n');

    return `
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Y-IT UNIVERSAL PRIMER v2.0 - MASTER LATEX TEMPLATE
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\documentclass[11pt, twoside, openright]{book}

% 1. KDP PAGE GEOMETRY & LAYOUT
\\usepackage[
    paperwidth=6in, paperheight=9in, top=0.75in, bottom=0.75in,
    inner=0.625in, outer=0.5in, bindingoffset=0.125in,
    headheight=14.5pt, includehead, includefoot,
]{geometry}

% 2. CORE PACKAGES
\\usepackage{graphicx}
\\usepackage{fontspec}
\\usepackage{xcolor}
\\usepackage{titlesec}
\\usepackage{fancyhdr}
\\usepackage{microtype}
\\usepackage{float}
\\usepackage{caption}
\\usepackage[most]{tcolorbox}
\\usepackage{setspace}
\\usepackage{wallpaper}
\\usepackage{hyperref}

% 3. COLOR SYSTEM
\\definecolor{YITbgPrimary}{HTML}{F5F2EC}
\\definecolor{YITbgSecondary}{HTML}{E5E0D8}
\\definecolor{YITtextPrimary}{HTML}{3A3A3A}
\\definecolor{YITtextSecondary}{HTML}{2E2E2E}
\\definecolor{YITaccentPrimary}{HTML}{5D7BEA}
\\pagecolor{YITbgPrimary}

% 4. TYPOGRAPHY SYSTEM
\\setmainfont{Helvetica Neue}
\\setstretch{1.2}
\\setlength{\\parindent}{0.25in}
\\setlength{\\parskip}{6pt}
\\raggedbottom

% 5. CHAPTER & SECTION STYLING
\\titleformat{\\chapter}[display]{\\normalfont\\bfseries\\color{YITtextPrimary}}{\\color{gray}\\fontsize{24pt}{28pt}\\selectfont CHAPTER \\thechapter}{0.5in}{\\fontsize{36pt}{42pt}\\selectfont}[\\vspace{1in}]
\\titleformat{\\section*}{\\normalfont\\bfseries\\fontsize{18pt}{22pt}\\selectfont\\color{YITtextPrimary}}{}{0em}{}

% 6. HEADERS & FOOTERS
\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[LE]{\\small\\color{gray}\\leftmark}
\\fancyhead[RO]{\\small\\color{gray}\\rightmark}
\\fancyfoot[C]{\\color{YITtextPrimary}\\thepage}
\\renewcommand{\\headrulewidth}{0pt}

% 7. CUSTOM COMMANDS
% Full Page Chapter Title
\\newcommand{\\createchapterpage}[2]{
    \\cleardoublepage
    \\thispagestyle{empty}
    \\ClearWallPaper
    %% TODO: Replace placeholder_comic.png with chapter specific image, e.g., 'chapter1_comic.png'
    \\ThisULCornerWallPaper{1.0}{#1}
    \\begin{tcolorbox}[
        width=\\textwidth, height=\\textheight, valign=center,
        colback=black, opacity=0.6, nobeforeafter, sharp corners, boxrule=0pt, center]
        \\color{white}\\fontsize{24pt}{28pt}\\selectfont CHAPTER \\thechapter
        \\par\\vspace{0.25in}
        \\color{white}\\fontsize{36pt}{42pt}\\bfseries #2
    \\end{tcolorbox}
    \\cleardoublepage
}

% Sidebar
\\newtcolorbox{sidebar}[1]{
    colback=YITbgSecondary, colframe=YITtextPrimary, boxrule=2pt,
    arc=0mm, sharp corners, title=\\bfseries\\color{YITtextPrimary}#1,
    fonttitle=\\bfseries, coltitle=YITtextPrimary,
    left=18pt, right=18pt, top=18pt, bottom=18pt,
    skipabove=\\baselineskip, skipbelow=\\baselineskip
}

% Guru Quote Box
\\newtcolorbox{gurubox}[2]{
    enhanced, sharp corners, colback=YITbgPrimary,
    borderline west={4pt}{0pt}{YITaccentPrimary},
    left=15pt, right=15pt, top=15pt, bottom=15pt,
    fontupper=\\itshape,
    overlay={\\node[anchor=south east, font=\\bfseries, color=YITtextSecondary] at (bottomright) {#2};}
}{#1}

% DOCUMENT START
\\begin{document}

\\frontmatter
\\begin{titlepage}
  \\centering
  \\vspace*{2cm}
  {\\Huge \\bfseries \\color{YITtextPrimary} The Unfiltered Truth About}\\\\[0.5cm]
  {\\fontsize{48}{52}\\selectfont \\bfseries \\color{YITaccentPrimary} ${book.topic}}\\\\[2cm]
  {\\Large A Y-It Production}\\\\[4cm]
  \\vfill
  {\\large Y-It Productions}
\\end{titlepage}

\\tableofcontents

\\mainmatter

${chapterLatex}

\\end{document}
    `.trim();
  }
  
  private markdownTableToLatex(markdown: string): string {
    const lines = markdown.trim().split('\\n').filter(Boolean);
    if (lines.length < 2) return markdown;

    // Check for separator line
    if (!lines[1].match(/^ *[|:-]+ *$/)) return markdown;

    const headerCells = lines[0].split('|').map(h => h.trim()).filter(Boolean);
    if (headerCells.length === 0) return markdown;

    const columnDefs = Array(headerCells.length).fill('l').join('');
    const headerLatex = headerCells.map(h => `\\textbf{${h}}`).join(' & ') + ' \\\\';

    const bodyRows = lines.slice(2).map(line => {
        const cells = line.split('|').map(c => c.trim()).filter(Boolean);
        // Pad rows with fewer cells
        while(cells.length < headerCells.length) {
            cells.push('');
        }
        return cells.slice(0, headerCells.length).join(' & ');
    }).join(' \\\\ \\n');

    return `
\\begin{center}
\\small
\\begin{tabular}{${columnDefs}}
\\hline
${headerLatex}
\\hline
${bodyRows} \\\\
\\hline
\\end{tabular}
\\end{center}
    `.trim();
  }

  private createChapterLatex(chapter: Chapter, chapterNumber: number): string {
    const comicPrompt = chapter.comic.panelDescriptions.map((desc, i) => `%% PANEL ${i+1}: ${desc}`).join('\\n');
    
    let chapterBody = chapter.body;

    if(chapter.chart) {
      chapterBody += `
\\begin{sidebar}{Chart Prompt: ${chapter.chart.title}}
    %% TODO: Generate this chart as 'chapter${chapterNumber}_chart.png' and place in the same directory.
    %% A 'placeholder_chart.png' file can be used here until the final asset is created.
    %% PROMPT: ${chapter.chart.prompt}
    \\textit{A placeholder for the chart image should be placed here. Use placeholder\\_chart.png if available.}
\\end{sidebar}
      `;
    }

    if(chapter.caseStudies && chapter.caseStudies.length > 0) {
      const caseStudiesLatex = chapter.caseStudies.map(cs => {
        let visualElementLatex = '';
        const ve = cs.visualElement;

        if (ve.type === 'Guru Quote Box') {
            visualElementLatex = `
\\begin{gurubox}{${ve.guruName || 'A Guru'}}
${ve.content}
\\end{gurubox}
            `;
        } else if (ve.content.includes('|')) { // Heuristic for markdown table
            visualElementLatex = `
\\begin{sidebar}{${ve.title}}
${this.markdownTableToLatex(ve.content)}
\\end{sidebar}
            `;
        } else {
             visualElementLatex = `
\\begin{sidebar}{${ve.title}}
${ve.content.replace(/\\n/g, ' \\\\ ')}
\\end{sidebar}
            `;
        }
        
        return `
\\section*{${cs.archetype}: ${cs.name}}
%% TODO: Generate caricature as '${cs.name.toLowerCase().replace(/\\s+/g, '_')}.png'.
%% PROMPT: ${cs.caricaturePrompt}

${cs.story}

${visualElementLatex}

\\begin{sidebar}{The Bottom Line}
\\textbf{Financial Autopsy:} ${cs.financialAutopsy}\\\\
\\textbf{The Zinger:} \\textit{${cs.zinger}}
\\end{sidebar}
        `;
      }).join('\\n\\n');
      chapterBody += '\\n' + caseStudiesLatex;
    }


    return `
%% COMIC GENERATION FOR CHAPTER ${chapterNumber}
%% TODO: Generate a ${chapter.comic.panelCount}-panel comic based on the descriptions below.
%% Save it as 'chapter${chapterNumber}_comic.png' and place it in the same directory as this .tex file.
%% The 'placeholder_comic.png' file is used as a stand-in for the chapter page background.
%%
%% Typography: ${chapter.comic.typography}
%% Suggested Layout: ${chapter.comic.layout}
%% Layout Rationale: ${chapter.comic.layoutRationale}
${comicPrompt}

\\createchapterpage{placeholder_comic.png}{${chapter.title}}
\\label{chap:${chapterNumber}}

${chapterBody}
    `;
  }
}
