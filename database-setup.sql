-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    goal INTEGER NOT NULL DEFAULT 8000,
    device_id VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create entries table
CREATE TABLE IF NOT EXISTS entries (
    id SERIAL PRIMARY KEY,
    participant_id INTEGER REFERENCES participants(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    steps INTEGER NOT NULL CHECK (steps >= 0),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(participant_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_participants_device_id ON participants(device_id);
CREATE INDEX IF NOT EXISTS idx_entries_participant_id ON entries(participant_id);
CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_participants_updated_at 
    BEFORE UPDATE ON participants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entries_updated_at 
    BEFORE UPDATE ON entries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 