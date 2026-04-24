-- Create subtopic_feedback table
CREATE TABLE IF NOT EXISTS subtopic_feedback (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    subtopic_tag VARCHAR(100) NOT NULL,
    experience_level VARCHAR(20) NOT NULL CHECK (experience_level IN ('easy', 'medium', 'hard')),
    preferences JSONB DEFAULT '[]',
    accuracy DECIMAL(5,2) NOT NULL CHECK (accuracy >= 0 AND accuracy <= 100),
    total_questions INTEGER NOT NULL CHECK (total_questions > 0),
    next_level VARCHAR(20) CHECK (next_level IN ('pass', 'average', 'expert')),
    next_subtopic VARCHAR(100),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subtopic_feedback_user_id ON subtopic_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_subtopic_feedback_subtopic_tag ON subtopic_feedback(subtopic_tag);
CREATE INDEX IF NOT EXISTS idx_subtopic_feedback_created_at ON subtopic_feedback(created_at);

-- Create unique constraint to prevent duplicate feedback for same user+subtopic in same session
-- Note: We'll handle this constraint in the application layer instead of a partial index
CREATE UNIQUE INDEX IF NOT EXISTS idx_subtopic_feedback_unique_user_subtopic 
ON subtopic_feedback(user_id, subtopic_tag, created_at);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subtopic_feedback_updated_at 
BEFORE UPDATE ON subtopic_feedback 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
