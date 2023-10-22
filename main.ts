import { Plugin } from 'obsidian';
const bulletEl = "<div class=\"list-bullet\"></div>";

export default class TimestampPlugin extends Plugin {
	async onload() {
		this.registerMarkdownPostProcessor((element, context) => {
			const codeblocks = element.findAll("li");

			for (const codeblock of codeblocks) {
				if (codeblock.innerHTML.startsWith(bulletEl) 
					&& codeblock.innerText.search(/\[\d{1,2}:\d{2}]/) == 0
				){
					const text: string = codeblock.innerText;
					const splitText: string[] = text.split(/]/g);
					const timestamp: string = (splitText.shift()).substring(1);
					const timestampEl = `<div class="timestamp-bullet">${timestamp}</div>`;
					const newText = timestampEl + splitText.join("]");
					codeblock.setHTML(newText);
				}
			}
		});
	}

	onunload() { }
}