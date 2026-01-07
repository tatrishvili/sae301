<?php

namespace App\Controller;

use App\Entity\Reservation;
use App\Repository\ReservationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class BackofficeController extends AbstractController
{
    #[Route('/backoffice', name: 'app_backoffice')]
    public function index(ReservationRepository $reservationRepository): Response
    {
        $reservations = $reservationRepository->findAll();

        // Serialize for JS
        $jsReservations = array_map(fn(Reservation $r) => [
            'id' => $r->getId(),
            'nom' => $r->getNom(),
            'prenom' => $r->getPrenom(),
            'email' => $r->getEmail(),
            'telephone' => $r->getTelephone(),
            'date' => $r->getDateReservation() ? $r->getDateReservation()->format('Y-m-d') : null,
            'horaire' => $r->getHoraire(),
            'ville' => $r->getVille(),
            'adresse' => $r->getAdresse(),
            'codePostal' => $r->getCodePostal(),
            'statut' => $r->getStatut(),
            'prix' => $r->getPrixTotal(),
            'prestations' => array_map(fn($rp) => $rp->getPrestation()->getNom(), $r->getReservationPrestations()->toArray()),
            'precisions' => array_map(fn($rp) => $rp->getPrecision(), $r->getReservationPrestations()->toArray()),
        ], $reservations);

        return $this->render('backoffice/backoffice.html.twig', [
            'reservations' => $reservations,
            'jsReservations' => json_encode($jsReservations),
        ]);
    }

    #[Route('/backoffice/reservation/{id}/validate', name: 'backoffice_reservation_validate', methods: ['POST'])]
    public function validate(Reservation $reservation, EntityManagerInterface $em): Response
    {
        $reservation->setStatut('confirmee');
        $em->flush();

        return $this->json(['success' => true]);
    }

    #[Route('/backoffice/reservation/{id}/cancel', name: 'backoffice_reservation_cancel', methods: ['POST'])]
    public function cancel(Reservation $reservation, EntityManagerInterface $em): Response
    {
        $reservation->setStatut('annulee');
        $em->flush();

        return $this->json(['success' => true]);
    }
}
