import { Api as CgApi } from 'chessground/api';
import { Key } from 'chessground/types';
import { Chess } from 'chessops';
import { makeFen, parseFen } from 'chessops/fen';
import { parseSan } from 'chessops/san';
import { makeUci } from 'chessops/util';

import { Ctrl } from './ctrl';
import { BoardCtrl } from './game';

interface Puzzle {
  id: string;
  fen: string;
  solution: string[];
  initialPly: number;
}

interface PuzzleGame {
  pgn: string;
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
    lastMove: this.lastMove,
    orientation: this.chess.turn,
    movable: {
      free: false,
    },
    viewOnly: true,
  });

  private pgnMoves = (pgn: string): string[] =>
    pgn
      .replace(/\{[^}]*\}|\([^)]*\)|\$\d+/g, ' ')
      .split(/\s+/)
      .filter(
        token => token && !/^\d+\.(\.\.)?$/.test(token) && !/^(1-0|0-1|1\/2-1\/2|\*)$/.test(token),
      );

  private lastMoveFromPgn = (pgn: string, initialPly: number): [Key, Key] | undefined => {
    const chess = Chess.default();
    const moves = this.pgnMoves(pgn);
    const firstMoveOfPuzzle = Math.max(0, initialPly + 1);
    let lastMove: [Key, Key] | undefined;

    for (let i = 0; i < Math.min(firstMoveOfPuzzle, moves.length); i++) {
      const move = parseSan(chess, moves[i]);
      if (!move) return undefined;

      const uci = makeUci(move);
      if (uci.length >= 4 && uci[1] !== '@') {
        lastMove = [uci.slice(0, 2) as Key, uci.slice(2, 4) as Key];
      }
      chess.play(move);
    }

    return lastMove;
  };

  setGround = (cg: CgApi) => (this.ground = cg);

  setPuzzleId = (id: string) => {
    this.puzzleId = id;
  };

  dailyPuzzle = async () => {
    const body = await this.root.auth.fetchBody(`/api/puzzle/daily`, { method: 'get' });
    this.puzzle = body.puzzle;
    this.lastMove = this.lastMoveFromPgn((body.game as PuzzleGame).pgn, this.puzzle!.initialPly);
    this.chess = Chess.fromSetup(parseFen(this.puzzle!.fen).unwrap()).unwrap();
    this.onUpdate();
  };


  puzzleById = async (id: string) => {
    const body = await this.root.auth.fetchBody(`/api/puzzle/${id}`, { method: 'get' });
    this.puzzle = body.puzzle;
      console.log('Loaded daily puzzle', body);
    this.lastMove = this.lastMoveFromPgn((body.game as PuzzleGame).pgn, this.puzzle!.initialPly);
    this.chess = Chess.fromSetup(parseFen(this.puzzle!.fen).unwrap()).unwrap();
    this.onUpdate();
  };
}
