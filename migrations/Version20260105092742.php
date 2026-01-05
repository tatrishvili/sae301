<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260105092742 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE prestation (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, nom VARCHAR(255) NOT NULL, prix DOUBLE PRECISION NOT NULL)');
        $this->addSql('CREATE TABLE reservation (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, nom VARCHAR(255) NOT NULL, prenom VARCHAR(255) NOT NULL, telephone VARCHAR(20) NOT NULL, email VARCHAR(255) NOT NULL, date_reservation DATE NOT NULL, horaire VARCHAR(50) NOT NULL, adresse VARCHAR(255) NOT NULL, code_postal VARCHAR(20) NOT NULL, ville VARCHAR(100) NOT NULL, prestations CLOB NOT NULL, created_at DATETIME NOT NULL, statut VARCHAR(50) NOT NULL, prix_total DOUBLE PRECISION DEFAULT NULL)');
        $this->addSql('CREATE TABLE reservation_prestation (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, precision VARCHAR(255) DEFAULT NULL, reservation_id INTEGER NOT NULL, prestation_id INTEGER NOT NULL, CONSTRAINT FK_31624619B83297E7 FOREIGN KEY (reservation_id) REFERENCES reservation (id) NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_316246199E45C554 FOREIGN KEY (prestation_id) REFERENCES prestation (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE INDEX IDX_31624619B83297E7 ON reservation_prestation (reservation_id)');
        $this->addSql('CREATE INDEX IDX_316246199E45C554 ON reservation_prestation (prestation_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE prestation');
        $this->addSql('DROP TABLE reservation');
        $this->addSql('DROP TABLE reservation_prestation');
    }
}
