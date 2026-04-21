import { Api as CgApi } from 'chessground/api';
import { Color, Key } from 'chessground/types';
import { Chess } from 'chessops';
import { chessgroundDests } from 'chessops/compat';
import { makeFen, parseFen } from 'chessops/fen';
import { parseSan } from 'chessops/san';
import { makeUci, opposite, parseUci } from 'chessops/util';

import { Ctrl } from './ctrl';
import { BoardCtrl } from './game';

interface Puzzle {
  id: string;
  solution: string[];
  initialPly: number;
  pov: Color;
}

interface PuzzleGame {
  pgn: string;
}

interface PuzzleResponse {
  puzzle: Puzzle;
  game: PuzzleGame;
}

export class PuzzleCtrl implements BoardCtrl {
  chess: Chess = Chess.default();
  lastMove?: [Key, Key];
  ground?: CgApi;
  puzzle?: Puzzle;
  puzzleGame?: PuzzleGame;
  puzzleId = '';
  canMove = false;
  solutionIndex = 0;

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
    orientation: this.puzzle ? this.puzzle.pov : 'white',
    fen: makeFen(this.chess.toSetup()),
    lastMove: this.lastMove,
    turnColor: this.chess.turn,
    check: !!this.chess.isCheck(),
    viewOnly: !this.canMove,
    movable: {
      free: false,
      color: this.canMove ? this.chess.turn : undefined,
      dests: chessgroundDests(this.chess),
    },
    events: {
      move: this.userMove,
    },
  });

  userMove = async (orig: Key, dest: Key) => {
    console.log(`User move: ${orig} -> ${dest}`);
    console.log('Solution:', this.puzzle?.solution);
    const beforeMoveFen = makeFen(this.chess.toSetup());
    const beforeMoveLastMove = this.lastMove;
    const move = parseUci(`${orig}${dest}`);
    if (!move) return;

    this.chess.play(move);
    this.lastMove = [orig, dest];
    this.canMove = false;
    this.onUpdate();

    // Compare move to solution after 200ms
    setTimeout(() => {
      if (!this.puzzle) return;
      const userMoveUci = `${orig}${dest}`;
      const expectedMove = this.puzzle.solution[this.solutionIndex];

      if (userMoveUci === expectedMove) {
        console.log('Correct move!');
        if (this.solutionIndex + 2 < this.puzzle.solution.length) {
          const opponentMove = this.puzzle.solution[this.solutionIndex + 1];
          const opponentMoveParsed = parseUci(opponentMove);
          if (opponentMoveParsed) {
            this.chess.play(opponentMoveParsed);
            this.lastMove = [opponentMove.slice(0, 2) as Key, opponentMove.slice(2, 4) as Key];
          }
          this.solutionIndex += 2;
          this.canMove = true;
          setTimeout(() => {
            this.onUpdate();
          }, 200);
        } else {
          console.log('Puzzle solved!');
        }
      } else {
        console.log(`Incorrect move. Expected: ${expectedMove}, but got: ${userMoveUci}`);
        const restoredSetup = parseFen(beforeMoveFen).unwrap();
        this.chess = Chess.fromSetup(restoredSetup).unwrap();
        this.lastMove = beforeMoveLastMove;
        this.canMove = true;
        this.onUpdate();
      }
    }, 200);
  };

  private pgnMoves = (pgn: string): string[] =>
    pgn
      .replace(/\{[^}]*\}|\([^)]*\)|\$\d+/g, ' ')
      .split(/\s+/)
      .filter(token => token && !/^\d+\.(\.\.)?$/.test(token) && !/^(1-0|0-1|1\/2-1\/2|\*)$/.test(token));

  private lastMoveFromPgn = (pgn: string, initialPly: number): [[Key, Key] | undefined, Chess] => {
    const chess = Chess.default();
    const moves = this.pgnMoves(pgn);
    const firstMoveOfPuzzle = Math.max(0, initialPly + 1);
    let lastMove: [Key, Key] | undefined;

    for (let i = 0; i < Math.min(firstMoveOfPuzzle, moves.length); i++) {
      const move = parseSan(chess, moves[i]);
      if (!move) return [undefined, chess];

      const uci = makeUci(move);
      if (uci.length >= 4 && uci[1] !== '@') {
        lastMove = [uci.slice(0, 2) as Key, uci.slice(2, 4) as Key];
      }
      chess.play(move);
    }

    return [lastMove, chess];
  };

  setGround = (cg: CgApi) => (this.ground = cg);

  setPuzzleId = (id: string) => {
    this.puzzleId = id;
  };

  private initPuzzle = async (puzzleResponse: PuzzleResponse) => {
    this.puzzle = puzzleResponse.puzzle;
    if (this.puzzle) {
      [this.lastMove, this.chess] = this.lastMoveFromPgn(
        (puzzleResponse.game as PuzzleGame).pgn,
        this.puzzle.initialPly,
      );
      this.canMove = true;
      this.solutionIndex = 0;
      this.puzzle.pov = this.chess.turn;

      this.onUpdate();
    }
  };

  dailyPuzzle = async () => {
    this.initPuzzle(await this.root.auth.fetchBody(`/api/puzzle/daily`, { method: 'get' }));
  };

  puzzleById = async (id: string) => {
    this.initPuzzle(await this.root.auth.fetchBody(`/api/puzzle/${id}`, { method: 'get' }));
  };

  nextPuzzle = async () => {
    console.log('Loading next puzzle...');
    this.initPuzzle(
      await this.root.auth.fetchBody(`/api/puzzle/next?angle=mateIn1`, { method: 'get'}),
    );
  };
}
