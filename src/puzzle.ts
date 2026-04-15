import { Api as CgApi } from 'chessground/api';
import { Key } from 'chessground/types';
import { Chess } from 'chessops';
import { makeFen, parseFen } from 'chessops/fen';

import { Ctrl } from './ctrl';
import { BoardCtrl } from './game';

interface Puzzle {
  id: string;
  fen: string;
  solution: string[];
}

export class PuzzleCtrl implements BoardCtrl {
  chess: Chess = Chess.default();
  lastMove?: [Key, Key];
  ground?: CgApi;
  puzzle?: Puzzle;
  puzzleId = '';

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
    fen: makeFen(this.chess.toSetup()),
    orientation: this.chess.turn,
    movable: {
      free: false,
    },
    viewOnly: true,
  });

  setGround = (cg: CgApi) => (this.ground = cg);

  setPuzzleId = (id: string) => {
    this.puzzleId = id;
  };

  dailyPuzzle = async () => {
    const body = await this.root.auth.fetchBody(`/api/puzzle/daily`, { method: 'get' });
    this.puzzle = body.puzzle;
    this.chess = Chess.fromSetup(parseFen(this.puzzle!.fen).unwrap()).unwrap();
    this.onUpdate();
  };


  puzzleById = async (id: string) => {
    const body = await this.root.auth.fetchBody(`/api/puzzle/${id}`, { method: 'get' });
    this.puzzle = body.puzzle;
    this.chess = Chess.fromSetup(parseFen(this.puzzle!.fen).unwrap()).unwrap();
    this.onUpdate();
  };
}
