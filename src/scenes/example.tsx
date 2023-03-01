import {makeScene2D} from '@motion-canvas/2d/lib/scenes';
import {waitFor, waitUntil} from '@motion-canvas/core/lib/flow';
import slideshow from '../slideshow.md?raw';
import { Marked, Renderer } from '@ts-stack/markdown';
import { createRef, Reference } from '@motion-canvas/core/lib/utils';
import { CodeBlock, Image, Rect, Text } from '@motion-canvas/2d/lib/components';

Marked.setOptions
({
  renderer: new Renderer,
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false
});

// Make a copy of the slideshow with hidden sections excluded
let in_comment = false;
let md = slideshow.split('\n').filter((line) => {
  if (line == '<!-- begin hide -->') {
    in_comment = true
    return false;
  } else if (line == '<!-- end hide -->') {
    in_comment = false
    return false;
  } else {
    return !in_comment;
  }
}).join('\n');

export default makeScene2D(function* (view) {
  // Create your animations here
  let rect = <Rect layout direction={'column'} justifyContent="center"></Rect>;
  view.add(rect);
  let counter = 0;
  for (const block of md.split('---')) {
    // Create the internal element we'll use to processthe output
    let div = document.createElement('div');
    div.innerHTML = Marked.parse(block);
    console.log(div.innerHTML);
    // Create a handle for every element
    let handles: Array<Reference<any>> = [];
    for (const element of div.children) {
      switch (element.tagName) {
        case "P": {
          let p_ref = createRef<Text>();
          handles.push(p_ref);
          rect.add(
            <Text
              ref={p_ref}
              fill="white"
              fontSize={72}
              opacity={0}
              textWrap={true}
            >
              {wrapTo(element.textContent, 48)}
            </Text>
          );
          break;
        }
        case "H1": {
          let h_ref = createRef<Text>();
          handles.push(h_ref);
          rect.add(
            <Text
              ref={h_ref}
              fill="white"
              fontSize={128}
              opacity={0}
              maxWidth="70%"
            >
              {element.textContent}
            </Text>
          );
          break;
        }

        case "H2": {
          let h_ref = createRef<Text>();
          handles.push(h_ref);
          rect.add(
            <Text
              ref={h_ref}
              fill="white"
              fontSize={106}
              opacity={0}
              maxWidth="70%"
            >
              {element.textContent}
            </Text>
          );
          break;
        }

        case "H3": {
          let h_ref = createRef<Text>();
          handles.push(h_ref);
          rect.add(
            <Text
              ref={h_ref}
              fill="white"
              fontSize={96}
              opacity={0}
              maxWidth="70%"
            >
              {element.textContent}
            </Text>
          );
          break;
        }

        case "HR": {
          let h_ref = createRef<Rect>();
          handles.push(h_ref);
          rect.add(
            <Rect
              ref={h_ref}
              fill="white"
              opacity={0}
              height={2}
              width="70%"
              marginBottom={32}
            >
            </Rect>
          );
          break;
        }

        case "IMG": {
          let h_ref = createRef<Image>();
          handles.push(h_ref);
          rect.add(
            <Image
              ref={h_ref}
              opacity={0}
              maxHeight="60%"
              maxWidth="70%"

            >
            </Image>
          );
          break;
        }

        case "PRE": {
          let code_el = element.children[0];
          let code = code_el.textContent;
          let lang = code_el.className.split('-')[1];
          let ref = createRef<CodeBlock>();
          handles.push(ref);
          rect.add(
            <CodeBlock
              ref={ref}
              opacity={0}
              language={lang as any}
            >
              {code}
            </CodeBlock>
          )
        }

        default: {
          console.log(block);
        }
      }
    }
    // Fade int each child, then clear children
    for (const handle of handles) {
      yield* handle().opacity(1, 0.1);
    }

    // End the slide
    yield* waitUntil(`slide ${++counter}`);

    // Fade out each child, then clear children
    for (const handle of handles) {
      yield* handle().opacity(0, 0.1);
    }
    rect.removeChildren();
  }
});

const wrapTo = (s: String, w: number) => s.replace(
  new RegExp(`(?![^\\n]{1,${w}}$)([^\\n]{1,${w}})\\s`, 'g'), '$1\n'
);