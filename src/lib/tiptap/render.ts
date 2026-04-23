import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';

const extensions = [StarterKit, Underline, Link, Image];

export function tiptapToHtml(json: object): string {
  try {
    return generateHTML(json as Parameters<typeof generateHTML>[0], extensions);
  } catch {
    return '';
  }
}
