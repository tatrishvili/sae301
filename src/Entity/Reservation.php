<?php

namespace App\Entity;

use App\Repository\ReservationRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ReservationRepository::class)]
class Reservation
{
    public const STATUT_EN_ATTENTE = 'en_attente';
    public const STATUT_CONFIRMEE = 'confirmee';
    public const STATUT_ANNULEE = 'annulee';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private string $nom;

    #[ORM\Column(length: 255)]
    private string $prenom;

    #[ORM\Column(length: 20)]
    private string $telephone;

    #[ORM\Column(length: 255)]
    private string $email;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private \DateTimeInterface $dateReservation;

    #[ORM\Column(length: 50)]
    private string $horaire;

    #[ORM\Column(length: 255)]
    private string $adresse;

    #[ORM\Column(length: 20)]
    private string $codePostal;

    #[ORM\Column(length: 100)]
    private string $ville;

    #[ORM\Column(type: Types::JSON)]
    private array $prestations = [];

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private \DateTimeInterface $createdAt;

    #[ORM\Column(length: 50)]
    private string $statut;

    #[ORM\Column(nullable: true)]
    private ?float $prixTotal = null;

    #[ORM\OneToMany(
        mappedBy: 'reservation',
        targetEntity: ReservationPrestation::class,
        cascade: ['persist', 'remove'],
        orphanRemoval: true
    )]
    private Collection $reservationPrestations;

    public function __construct()
    {
        $this->reservationPrestations = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
        $this->statut = self::STATUT_EN_ATTENTE;
    }

    // ------------------ GETTERS & SETTERS ------------------

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNom(): string
    {
        return $this->nom;
    }

    public function setNom(string $nom): self
    {
        $this->nom = $nom;
        return $this;
    }

    public function getPrenom(): string
    {
        return $this->prenom;
    }

    public function setPrenom(string $prenom): self
    {
        $this->prenom = $prenom;
        return $this;
    }

    public function getTelephone(): string
    {
        return $this->telephone;
    }

    public function setTelephone(string $telephone): self
    {
        $this->telephone = $telephone;
        return $this;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;
        return $this;
    }

    public function getDateReservation(): \DateTimeInterface
    {
        return $this->dateReservation;
    }

    public function setDateReservation(\DateTimeInterface $dateReservation): self
    {
        $this->dateReservation = $dateReservation;
        return $this;
    }

    public function getHoraire(): string
    {
        return $this->horaire;
    }

    public function setHoraire(string $horaire): self
    {
        $this->horaire = $horaire;
        return $this;
    }

    public function getAdresse(): string
    {
        return $this->adresse;
    }

    public function setAdresse(string $adresse): self
    {
        $this->adresse = $adresse;
        return $this;
    }

    public function getCodePostal(): string
    {
        return $this->codePostal;
    }

    public function setCodePostal(string $codePostal): self
    {
        $this->codePostal = $codePostal;
        return $this;
    }

    public function getVille(): string
    {
        return $this->ville;
    }

    public function setVille(string $ville): self
    {
        $this->ville = $ville;
        return $this;
    }

    public function getPrestations(): array
    {
        return $this->prestations;
    }

    public function setPrestations(array $prestations): self
    {
        $this->prestations = $prestations;
        return $this;
    }

    public function getCreatedAt(): \DateTimeInterface
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeInterface $createdAt): self
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getStatut(): string
    {
        return $this->statut;
    }

    public function setStatut(string $statut): self
    {
        $this->statut = $statut;
        return $this;
    }

    public function getPrixTotal(): ?float
    {
        return $this->prixTotal;
    }

    public function setPrixTotal(?float $prixTotal): self
    {
        $this->prixTotal = $prixTotal;
        return $this;
    }

    /**
     * @return Collection<int, ReservationPrestation>
     */
    public function getReservationPrestations(): Collection
    {
        return $this->reservationPrestations;
    }

    public function addReservationPrestation(ReservationPrestation $reservationPrestation): self
    {
        if (!$this->reservationPrestations->contains($reservationPrestation)) {
            $this->reservationPrestations->add($reservationPrestation);
            $reservationPrestation->setReservation($this);
        }
        return $this;
    }

    public function removeReservationPrestation(ReservationPrestation $reservationPrestation): self
    {
        if ($this->reservationPrestations->removeElement($reservationPrestation)) {
            if ($reservationPrestation->getReservation() === $this) {
                $reservationPrestation->setReservation(null);
            }
        }
        return $this;
    }
}
