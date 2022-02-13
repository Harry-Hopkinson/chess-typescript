import {
	TypedUseSelectorHook,
	useSelector as useReduxSelector,
} from "react-redux";
import {
	configureStore,
	getDefaultMiddleware,
	createSlice,
} from "@reduxjs/toolkit";

import { State, Square } from "./types";
import { rows, columns } from "./constants";

const initialState: State = {
	error: "",
	chess: {
		fen: "",
		turn: "w",
		pieces: [],
		squares: [],
		checkers: [],
		gameNumber: 1,
		legalMoves: [],
		rotated: false,
		enPassant: "-",
		dragging: null,
		latestMove: "",
		castling: "KQkq",
		halfMoveClock: 0,
		fullMoveNumber: 1,
		userColor: "none",
		noMaterial: false,
		availableSquares: [],
		requestPromotion: false,
	},
};

export const { actions, reducer } = createSlice({
	name: "store",
	initialState,
	reducers: {
		startChess: (state) => {
			state.chess = {
				...initialState.chess,
				gameNumber: state.chess.gameNumber,
				userColor: state.chess.userColor,
				pieces: [
					{ name: "r", color: "b", row: "8", column: "a" },
					{ name: "n", color: "b", row: "8", column: "b" },
					{ name: "b", color: "b", row: "8", column: "c" },
					{ name: "q", color: "b", row: "8", column: "d" },
					{ name: "k", color: "b", row: "8", column: "e" },
					{ name: "b", color: "b", row: "8", column: "f" },
					{ name: "n", color: "b", row: "8", column: "g" },
					{ name: "r", color: "b", row: "8", column: "h" },
					{ name: "p", color: "b", row: "7", column: "a" },
					{ name: "p", color: "b", row: "7", column: "b" },
					{ name: "p", color: "b", row: "7", column: "c" },
					{ name: "p", color: "b", row: "7", column: "d" },
					{ name: "p", color: "b", row: "7", column: "e" },
					{ name: "p", color: "b", row: "7", column: "f" },
					{ name: "p", color: "b", row: "7", column: "g" },
					{ name: "p", color: "b", row: "7", column: "h" },
					{ name: "R", color: "w", row: "1", column: "a" },
					{ name: "N", color: "w", row: "1", column: "b" },
					{ name: "B", color: "w", row: "1", column: "c" },
					{ name: "Q", color: "w", row: "1", column: "d" },
					{ name: "K", color: "w", row: "1", column: "e" },
					{ name: "B", color: "w", row: "1", column: "f" },
					{ name: "N", color: "w", row: "1", column: "g" },
					{ name: "R", color: "w", row: "1", column: "h" },
					{ name: "P", color: "w", row: "2", column: "a" },
					{ name: "P", color: "w", row: "2", column: "b" },
					{ name: "P", color: "w", row: "2", column: "c" },
					{ name: "P", color: "w", row: "2", column: "d" },
					{ name: "P", color: "w", row: "2", column: "e" },
					{ name: "P", color: "w", row: "2", column: "f" },
					{ name: "P", color: "w", row: "2", column: "g" },
					{ name: "P", color: "w", row: "2", column: "h" },
				],
			};
		},
		setChess: (state: { chess: any }, action: { payload: any }) => {
			state.chess = {
				...state.chess,
				...action.payload,
			};
		},
		setAvailableSquares: (
			state: { chess: { availableSquares: any; legalMoves: any[] } },
			action: { payload: any }
		) => {
			state.chess.availableSquares = state.chess.legalMoves.reduce(
				(squares: string[], move) => {
					if (move.indexOf(action.payload) === 0)
						squares.push(move.substring(2, 4));
					return squares;
				},
				[]
			);
		},
		chessMove: (state: { chess: any }, action: { payload: any }) => {
			const move = action.payload;
			const c = state.chess;

			c.latestMove = move;

			if (c.latestMove === "(none)") return;

			const [originalColumn, originalRow, newColumn, newRow, promotion] =
				move.slice("");

			const originalPiece = c.pieces.find(
				(piece: { taken: any; column: any; row: any }) =>
					!piece.taken &&
					piece.column === originalColumn &&
					piece.row === originalRow
			);

			if (!originalPiece)
				return console.log("Error Making the Selected Move", move);
			c.availableSquares = [];

			const attackedPiece = c.pieces.find(
				(piece: { taken: any; column: any; row: any }) =>
					!piece.taken &&
					piece.column === newColumn &&
					piece.row === newRow
			);

			if (attackedPiece) {
				attackedPiece.taken = true;
			}

			if (
				["P", "p"].includes(originalPiece.name) &&
				`${newColumn}${newRow}` === c.enPassant
			) {
				const removedPawn = c.pieces.find(
					(piece: {
						taken: any;
						name: string;
						column: any;
						row: string;
					}) =>
						!piece.taken &&
						["P", "p"].includes(piece.name) &&
						piece.column === newColumn &&
						piece.row ===
							`${
								parseInt(newRow, 10) +
								(originalPiece.name === "P" ? -1 : 1)
							}`
				);

				if (removedPawn) removedPawn.taken = true;
			}

			const originalRowIndex = rows.indexOf(originalPiece.row);
			const newRowIndex = rows.indexOf(newRow);

			c.enPassant = "-";

			if (
				originalPiece.name === "P" &&
				originalRowIndex - newRowIndex === 2
			) {
				c.enPassant = newColumn + (parseInt(originalPiece.row, 10) + 1);
			}

			if (
				originalPiece.name === "p" &&
				originalRowIndex - newRowIndex === -2
			) {
				c.enPassant = newColumn + (parseInt(originalPiece.row, 10) - 1);
			}

			if (originalPiece.name === "R") {
				if (originalPiece.column === "a")
					c.castling = c.castling.replace("Q", "");
				if (originalPiece.column === "h")
					c.castling = c.castling.replace("K", "");
			}

			if (originalPiece.name === "r") {
				if (originalPiece.column === "a")
					c.castling = c.castling.replace("q", "");
				if (originalPiece.column === "h")
					c.castling = c.castling.replace("k", "");
			}

			if (attackedPiece?.name === "R") {
				if (attackedPiece.column === "a")
					c.castling = c.castling.replace("Q", "");
				if (attackedPiece.column === "h")
					c.castling = c.castling.replace("K", "");
			}

			if (attackedPiece?.name === "r") {
				if (attackedPiece.column === "a")
					c.castling = c.castling.replace("q", "");
				if (attackedPiece.column === "h")
					c.castling = c.castling.replace("k", "");
			}

			if (originalPiece.name === "K") {
				c.castling = c.castling.replace("Q", "");
				c.castling = c.castling.replace("K", "");

				if (originalPiece.column === "e") {
					if (newColumn === "g") {
						const rook = c.pieces.find(
							(piece: {
								taken: any;
								name: string;
								column: string;
								row: string;
							}) =>
								!piece.taken &&
								piece.name === "R" &&
								piece.column === "h" &&
								piece.row === "1"
						);

						if (rook) rook.column = "f";
					} else if (newColumn === "c") {
						const rook = c.pieces.find(
							(piece: {
								taken: any;
								name: string;
								column: string;
								row: string;
							}) =>
								!piece.taken &&
								piece.name === "R" &&
								piece.column === "a" &&
								piece.row === "1"
						);

						if (rook) rook.column = "d";
					}
				}
			} else if (originalPiece.name === "k") {
				c.castling = c.castling.replace("q", "");
				c.castling = c.castling.replace("k", "");

				if (originalPiece.column === "e") {
					if (newColumn === "g") {
						const rook = c.pieces.find(
							(piece: {
								taken: any;
								name: string;
								column: string;
								row: string;
							}) =>
								!piece.taken &&
								piece.name === "r" &&
								piece.column === "h" &&
								piece.row === "8"
						);

						if (rook) {
							rook.column = "f";
						}
					} else if (newColumn === "c") {
						const rook = c.pieces.find(
							(piece: {
								taken: any;
								name: string;
								column: string;
								row: string;
							}) =>
								!piece.taken &&
								piece.name === "r" &&
								piece.column === "a" &&
								piece.row === "8"
						);

						if (rook) rook.column = "d";
					}
				}
			}

			if (originalPiece.name === "P" && newRow === "8") {
				if (!promotion) {
					c.requestPromotion = true;
					return;
				}

				originalPiece.name = promotion.toUpperCase();

				c.requestPromotion = false;
			}

			if (originalPiece.name === "p" && newRow === "1") {
				if (!promotion) {
					c.requestPromotion = true;
					return;
				}

				originalPiece.name = promotion;

				c.requestPromotion = false;
			}

			originalPiece.row = newRow;

			originalPiece.column = newColumn;

			c.turn = c.turn === "w" ? "b" : "w";

			if (c.turn === "w") c.fullMoveNumber += 1;

			c.halfMoveClock = attackedPiece ? 0 : c.halfMoveClock + 1;

			const remainingPieces: {
				[color: string]: string[];
			} = { w: [], b: [] };

			c.squares = c.pieces.reduce(
				(
					squares: Square[],
					piece: {
						taken: any;
						color: string;
						name: string;
						row: string;
						column: string;
					}
				) => {
					if (piece.taken) return squares;

					remainingPieces[piece.color].push(piece.name);

					const index =
						rows.indexOf(piece.row) * 8 +
						columns.indexOf(piece.column);

					squares[index] = { piece, index };

					return squares;
				},
				new Array(64).fill(null)
			);

			c.noMaterial =
				remainingPieces.w.length <= 2 &&
				!remainingPieces.w.find((p) => !["K", "N", "B"].includes(p)) &&
				remainingPieces.b.length <= 2 &&
				!remainingPieces.b.find((p) => !["k", "n", "b"].includes(p));

			const { fenPieces } = c.squares.reduce(
				(
					memo: { fenPieces: string; emptyCount: number },
					square: { piece: { name: string } },
					index: number
				) => {
					if (index && index % 8 === 0) {
						if (memo.emptyCount) memo.fenPieces += memo.emptyCount;
						memo.emptyCount = 0;
						memo.fenPieces += "/";
					}

					if (!square) {
						memo.emptyCount += 1;
						return memo;
					}

					if (memo.emptyCount) memo.fenPieces += memo.emptyCount;

					memo.emptyCount = 0;

					memo.fenPieces += square.piece.name;

					return memo;
				},
				{ fenPieces: "", emptyCount: 0 }
			);

			c.fen = `fen ${fenPieces} ${c.turn} ${c.castling || "-"} ${
				c.enPassant
			} ${c.halfMoveClock} ${c.fullMoveNumber}`;
		},
	},
});

const store = configureStore({
	reducer,
	devTools: true,
	middleware: getDefaultMiddleware(),
});

export default store;
export { useDispatch } from "react-redux";
export const useSelector: TypedUseSelectorHook<State> = useReduxSelector;
