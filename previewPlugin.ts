import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
  MatchDecorator,
} from "@codemirror/view";

class TimestampBulletWidget extends WidgetType {
  private text: string;

  constructor(text: string) {
    super();
    const start = text.indexOf('[') + 1;
    const end = text.indexOf(']')
    this.text = text.substring(start, end);
  }

  toDOM(view: EditorView): HTMLElement {
    const div = document.createElement("span");
    div.addClass("timestamp-bullet")

    div.innerText = this.text;

    return div;
  }
}

const matcher = new MatchDecorator({
  regexp: /^- \[\d{1,2}:\d{2}\] /gm,
  decoration: match => Decoration.replace({
    widget: new TimestampBulletWidget(match[0]),
  })
})

export const previewPlugin = ViewPlugin.fromClass(class {
  placeholders: DecorationSet
  constructor(view: EditorView) {
    this.placeholders = matcher.createDeco(view)
  }
  update(update: ViewUpdate) {
    const isSource = app.workspace.activeLeaf ? app.workspace.activeLeaf.getViewState().state.source : false

    this.placeholders = matcher.createDeco(update.view)
    this.placeholders = this.placeholders.update({
      filter: x => !isSource
    });
  }
}, {
  decorations: instance => instance.placeholders,
  provide: plugin => EditorView.atomicRanges.of(view => {
    return view.plugin(plugin)?.placeholders || Decoration.none
  })
})