
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Book } from '../../models/book-content.model';

@Component({
  selector: 'app-latex-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './latex-preview.component.html',
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LatexPreviewComponent {
  latexCode = input.required<string>();
  bookContent = input.required<Book | null>();

  copyButtonText = signal<'Copy' | 'Copied!'>('Copy');
  isExportMenuOpen = signal(false);

  hasValidCode = computed(() => {
    const code = this.latexCode();
    return code && code.trim().length > 0;
  });

  toggleExportMenu() {
    this.isExportMenuOpen.update(v => !v);
  }

  copyLatexToClipboard() {
    if (!this.hasValidCode()) return;
    navigator.clipboard.writeText(this.latexCode()).then(() => {
      this.copyButtonText.set('Copied!');
      setTimeout(() => this.copyButtonText.set('Copy'), 2000);
    });
    this.isExportMenuOpen.set(false);
  }

  downloadTexFile() {
    if (!this.hasValidCode()) return;
    const blob = new Blob([this.latexCode()], { type: 'text/plain;charset=utf-8' });
    this.createDownloadLink(blob, 'book.tex');
    this.isExportMenuOpen.set(false);
  }

  downloadJson() {
    const content = this.bookContent();
    if (!content) return;

    const jsonContent = JSON.stringify(content, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
    this.createDownloadLink(blob, `${content.topic.toLowerCase().replace(/\s+/g, '_')}_content.json`);
    this.isExportMenuOpen.set(false);
  }

  downloadMarkdownPrompts() {
    const content = this.bookContent();
    if (!content) return;
    
    let markdownContent = `# Y-It Generation Prompts for "${content.topic}"\n\n`;

    content.chapters.forEach((chapter, index) => {
      markdownContent += `## Chapter ${index + 1}: ${chapter.title}\n\n`;
      markdownContent += `### Comic Prompt\n\n`;
      markdownContent += `- **Typography:** ${chapter.comic.typography}\n`;
      markdownContent += `- **Panel Count:** ${chapter.comic.panelCount}\n`;
      markdownContent += `- **Suggested Layout:** ${chapter.comic.layout}\n`;
      markdownContent += `- **Layout Rationale:** ${chapter.comic.layoutRationale}\n`;
      chapter.comic.panelDescriptions.forEach((desc, i) => {
        markdownContent += `  - **Panel ${i + 1}:** ${desc}\n`;
      });
      markdownContent += `\n`;

      if (chapter.chart) {
        markdownContent += `### Chart Prompt\n\n`;
        markdownContent += `**Title:** ${chapter.chart.title}\n\n`;
        markdownContent += "```\n" + chapter.chart.prompt + "\n```\n\n";
      }

      if (chapter.caseStudies) {
        markdownContent += `### Case Study Caricature Prompts\n\n`;
        chapter.caseStudies.forEach(cs => {
          markdownContent += `**${cs.archetype}: ${cs.name}**\n`;
          markdownContent += "```\n" + cs.caricaturePrompt + "\n```\n\n";
        });
      }
      markdownContent += '---\n\n';
    });

    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    this.createDownloadLink(blob, `${content.topic.toLowerCase().replace(/\s+/g, '_')}_prompts.md`);
    this.isExportMenuOpen.set(false);
  }

  private createDownloadLink(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
