<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260106192837 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE reservation_prestation ADD COLUMN prix DOUBLE PRECISION NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TEMPORARY TABLE __temp__reservation_prestation AS SELECT id, precision, reservation_id, prestation_id FROM reservation_prestation');
        $this->addSql('DROP TABLE reservation_prestation');
        $this->addSql('CREATE TABLE reservation_prestation (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, precision VARCHAR(255) DEFAULT NULL, reservation_id INTEGER NOT NULL, prestation_id INTEGER NOT NULL, CONSTRAINT FK_31624619B83297E7 FOREIGN KEY (reservation_id) REFERENCES reservation (id) NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_316246199E45C554 FOREIGN KEY (prestation_id) REFERENCES prestation (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('INSERT INTO reservation_prestation (id, precision, reservation_id, prestation_id) SELECT id, precision, reservation_id, prestation_id FROM __temp__reservation_prestation');
        $this->addSql('DROP TABLE __temp__reservation_prestation');
        $this->addSql('CREATE INDEX IDX_31624619B83297E7 ON reservation_prestation (reservation_id)');
        $this->addSql('CREATE INDEX IDX_316246199E45C554 ON reservation_prestation (prestation_id)');
    }
}
