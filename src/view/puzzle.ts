import { Color } from 'chessground/types';
import { opposite } from 'chessground/util';
import { h } from 'snabbdom';

import { Renderer } from '../interfaces';
import { PuzzleCtrl } from '../puzzle';
import { renderBoard, renderPlayer } from './board';

import '../../scss/_puzzle.scss';
import { clockContent } from './clock';

export const renderPuzzle: (ctrl: PuzzleCtrl) => Renderer = ctrl => _ => [
  h(`div.game-page.game-page`, [h('aside.game-page__left-float', []), renderBoard(ctrl)]),
];
