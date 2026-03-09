import type { UserMessage } from '../../types';
import { div, span } from '../../utils/dom';

export class UserRenderer {
  renderUser(msg: UserMessage, target: HTMLElement | DocumentFragment): void {
    const el = div('msg-user');
    el.appendChild(span('user-prompt', '❯'));
    el.appendChild(span('user-text', msg.text));
    target.appendChild(el);
  }
}
