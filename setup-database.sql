-- =====================================================
-- Marimecs Dart Club - Complete Database Setup Script
-- =====================================================
-- This script creates all tables, indexes, and constraints
-- from scratch. Run this in Supabase SQL Editor.
-- =====================================================

-- 1. Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS "ScoreConfirmation" CASCADE;
DROP TABLE IF EXISTS "MatchMessage" CASCADE;
DROP TABLE IF EXISTS "MatchTurn" CASCADE;
DROP TABLE IF EXISTS "Match" CASCADE;
DROP TABLE IF EXISTS "Score" CASCADE;
DROP TABLE IF EXISTS "Player" CASCADE;
DROP TABLE IF EXISTS "VerificationToken" CASCADE;
DROP TABLE IF EXISTS "Session" CASCADE;
DROP TABLE IF EXISTS "Account" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- 2. Create MatchStatus enum type
DROP TYPE IF EXISTS "MatchStatus";
CREATE TYPE "MatchStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'DISPUTED', 'CANCELLED');

-- 3. Create User table (replaces Player table)
CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT,
  "email" TEXT NOT NULL,
  "emailVerified" TIMESTAMP(3),
  "image" TEXT,
  "password" TEXT,
  "nickname" TEXT,
  "avatar" TEXT,
  "initials" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- 4. Create Account table (NextAuth)
CREATE TABLE "Account" (
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,

  CONSTRAINT "Account_pkey" PRIMARY KEY ("provider", "providerAccountId")
);

-- 5. Create Session table (NextAuth)
CREATE TABLE "Session" (
  "sessionToken" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Session_pkey" PRIMARY KEY ("sessionToken")
);

-- 6. Create VerificationToken table (NextAuth)
CREATE TABLE "VerificationToken" (
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier", "token")
);

-- 7. Create Match table
CREATE TABLE "Match" (
  "id" TEXT NOT NULL,
  "player1Id" TEXT NOT NULL,
  "player2Id" TEXT NOT NULL,
  "gameType" TEXT NOT NULL,
  "player1Score" INTEGER,
  "player2Score" INTEGER,
  "status" "MatchStatus" NOT NULL DEFAULT 'IN_PROGRESS',
  "winnerId" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),

  CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- 8. Create MatchTurn table
CREATE TABLE "MatchTurn" (
  "id" TEXT NOT NULL,
  "matchId" TEXT NOT NULL,
  "playerId" TEXT NOT NULL,
  "turnNumber" INTEGER NOT NULL,
  "dart1" INTEGER,
  "dart2" INTEGER,
  "dart3" INTEGER,
  "turnScore" INTEGER NOT NULL DEFAULT 0,
  "remainingScore" INTEGER,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "MatchTurn_pkey" PRIMARY KEY ("id")
);

-- 9. Create MatchMessage table (for chat)
CREATE TABLE "MatchMessage" (
  "id" TEXT NOT NULL,
  "matchId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "MatchMessage_pkey" PRIMARY KEY ("id")
);

-- 10. Create ScoreConfirmation table
CREATE TABLE "ScoreConfirmation" (
  "id" TEXT NOT NULL,
  "matchId" TEXT NOT NULL,
  "turnId" TEXT NOT NULL,
  "confirmingPlayerId" TEXT NOT NULL,
  "confirmed" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ScoreConfirmation_pkey" PRIMARY KEY ("id")
);

-- 11. Create Score table (updated to reference User)
CREATE TABLE "Score" (
  "id" TEXT NOT NULL,
  "score" INTEGER NOT NULL,
  "userId" TEXT NOT NULL,
  "gameType" TEXT NOT NULL DEFAULT '501',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "checkout" TEXT,
  "notes" TEXT,

  CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- 12. Create indexes
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE INDEX "Account_userId_idx" ON "Account"("userId");

CREATE INDEX "Session_userId_idx" ON "Session"("userId");

CREATE INDEX "Match_player1Id_idx" ON "Match"("player1Id");
CREATE INDEX "Match_player2Id_idx" ON "Match"("player2Id");
CREATE INDEX "Match_status_idx" ON "Match"("status");

CREATE INDEX "MatchTurn_matchId_idx" ON "MatchTurn"("matchId");
CREATE INDEX "MatchTurn_playerId_idx" ON "MatchTurn"("playerId");

CREATE INDEX "MatchMessage_matchId_idx" ON "MatchMessage"("matchId");
CREATE INDEX "MatchMessage_userId_idx" ON "MatchMessage"("userId");

CREATE INDEX "ScoreConfirmation_matchId_idx" ON "ScoreConfirmation"("matchId");
CREATE INDEX "ScoreConfirmation_turnId_idx" ON "ScoreConfirmation"("turnId");

CREATE INDEX "Score_userId_idx" ON "Score"("userId");
CREATE INDEX "Score_gameType_idx" ON "Score"("gameType");

-- 13. Add foreign key constraints
ALTER TABLE "Account" 
  ADD CONSTRAINT "Account_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "Session" 
  ADD CONSTRAINT "Session_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "Match" 
  ADD CONSTRAINT "Match_player1Id_fkey" 
  FOREIGN KEY ("player1Id") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "Match" 
  ADD CONSTRAINT "Match_player2Id_fkey" 
  FOREIGN KEY ("player2Id") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "Match" 
  ADD CONSTRAINT "Match_winnerId_fkey" 
  FOREIGN KEY ("winnerId") REFERENCES "User"("id") ON DELETE SET NULL;

ALTER TABLE "MatchTurn" 
  ADD CONSTRAINT "MatchTurn_matchId_fkey" 
  FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE;

ALTER TABLE "MatchTurn" 
  ADD CONSTRAINT "MatchTurn_playerId_fkey" 
  FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "MatchMessage" 
  ADD CONSTRAINT "MatchMessage_matchId_fkey" 
  FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE;

ALTER TABLE "MatchMessage" 
  ADD CONSTRAINT "MatchMessage_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "ScoreConfirmation" 
  ADD CONSTRAINT "ScoreConfirmation_matchId_fkey" 
  FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE;

ALTER TABLE "ScoreConfirmation" 
  ADD CONSTRAINT "ScoreConfirmation_turnId_fkey" 
  FOREIGN KEY ("turnId") REFERENCES "MatchTurn"("id") ON DELETE CASCADE;

ALTER TABLE "ScoreConfirmation" 
  ADD CONSTRAINT "ScoreConfirmation_confirmingPlayerId_fkey" 
  FOREIGN KEY ("confirmingPlayerId") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "Score" 
  ADD CONSTRAINT "Score_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

-- =====================================================
-- Database Setup Complete!
-- =====================================================
-- All tables, indexes, and constraints have been created.
-- You can now use the application with the new database.
-- =====================================================
