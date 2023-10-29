import { syntaxTree } from "@codemirror/language";
import { RangeSetBuilder } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  PluginSpec,
  PluginValue,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";

class TimestampBulletWidget extends WidgetType {
  private text: string;

  constructor(text:string) {
    super();
    this.text = text;
  }

  toDOM(view: EditorView): HTMLElement {
    const div = document.createElement("span");
    div.addClass("timestamp-bullet")

    div.innerText = this.text;

    return div;
  }
}

class PreviewPlugin implements PluginValue {
  decorations: DecorationSet;

  constructor(view: EditorView) {
    this.decorations = this.buildDecorations(view);
  }

  update(update: ViewUpdate) {
    if (update.docChanged || update.viewportChanged) {
      this.decorations = this.buildDecorations(update.view);
    }
  }

  destroy() {}

  buildDecorations(view: EditorView): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>();

    for (const { from, to } of view.visibleRanges) {
      syntaxTree(view.state).iterate({
        from,
        to,
        enter(node) {
          if (node.type.name.contains("formatting-list")) {
            const listCharFrom = node.from;
            let listCharTo = listCharFrom;
            let timeStamp = "";
            
            if (node.nextSibling()
              && node.name.contains("hmd-barelink")
              && node.nextSibling() 
              && node.name.contains("hmd-barelink")
            ){
              timeStamp = view.state.sliceDoc(node.from, node.to);
              if (node.nextSibling() 
                && node.name.contains("hmd-barelink")){
                  listCharTo = node.to;
                }
            }

            if (listCharFrom != listCharTo
              && timeStamp.search(/\d{1,2}:\d{2}/) == 0
              && timeStamp.length < 6) {
              builder.add(
                listCharFrom,
                listCharTo,
                Decoration.replace({
                  widget: new TimestampBulletWidget(timeStamp),
                })
              );              
            }
          }
        },
      });
    }

    return builder.finish();
  }
} 

const pluginSpec: PluginSpec<PreviewPlugin> = {
  decorations: (value: PreviewPlugin) => value.decorations,
};

export const previewPlugin = ViewPlugin.fromClass(
  PreviewPlugin,
  pluginSpec
);