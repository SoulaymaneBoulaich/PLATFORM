# Import init.sql into Docker MySQL with foreign key checks disabled

Write-Host "Importing database schema and seed data..." -ForegroundColor Cyan

# Read init.sql
$sql = Get-Content "db\init.sql" -Raw

# Wrap with foreign key checks disabled
$wrapped = "SET FOREIGN_KEY_CHECKS=0;`n$sql`nSET FOREIGN_KEY_CHECKS=1;"

# Execute
$wrapped | docker exec -i realestate-db mysql -urealestateuser -pStrongPassword123! real_estate_db

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Import successful!`n" -ForegroundColor Green
    Write-Host "Verifying tables..."
    docker exec -i realestate-db mysql -urealestateuser -pStrongPassword123! real_estate_db -e "SHOW TABLES;"
} else {
    Write-Host "`n✗ Import failed!`n" -ForegroundColor Red
}
