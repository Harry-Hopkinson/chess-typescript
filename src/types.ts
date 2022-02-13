export type Piece = {
	name: string;
	color: string;
	row: string;
	column: string;
	taken?: boolean;
};

export type Square = null | {
	piece: Piece;
	index: number;
};

export type State = {
	error: string;
	chess: {
		fen: string;
		pieces: Piece[];
		turn: "w" | "b";
		castling: string;
		rotated: boolean;
		squares: Square[];
		enPassant: string;
		latestMove: string;
		gameNumber: number;
		checkers: string[];
		noMaterial: boolean;
		legalMoves: string[];
		halfMoveClock: number;
		fullMoveNumber: number;
		dragging: null | Piece;
		requestPromotion: boolean;
		availableSquares: string[];
		userColor: "w" | "b" | "none" | "both";
	};
};
