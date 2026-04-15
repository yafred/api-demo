import { Api as CgApi } from 'chessground/api';
import { Config as CgConfig } from 'chessground/config';
import { Color, Key } from 'chessground/types';
import { Chess, defaultSetup } from 'chessops';
import { chessgroundDests } from 'chessops/compat';
import { makeFen, parseFen } from 'chessops/fen';
import { opposite, parseUci } from 'chessops/util';

import { Ctrl } from './ctrl';
import { BoardCtrl } from './game';
import { Game } from './interfaces';
import { Stream } from './ndJsonStream';

export class PuzzleCtrl implements BoardCtrl {
  chess: Chess = Chess.default();
  lastMove?: [Key, Key];
  ground?: CgApi;

  constructor(private root: Ctrl) {
    this.onUpdate();
  }

  private onUpdate = () => {
    this.ground?.set(this.chessgroundConfig());
  };

  chessgroundConfig = () => ({
    real3D: {
      sceneAssetUrl: 'scene.glb',
    },
    movable: {
      free: false,
    },
    viewOnly: true,
  });

  setGround = (cg: CgApi) => (this.ground = cg);
}
