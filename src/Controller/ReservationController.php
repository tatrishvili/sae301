<?php

namespace App\Controller;

use App\Entity\Reservation;
use App\Entity\ReservationPrestation;
use App\Repository\ReservationRepository;
use App\Repository\PrestationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class ReservationController extends AbstractController
{
    // Backoffice page showing all reservations
    #[Route('/reservation', name: 'app_reservation')]
    public function index(ReservationRepository $reservationRepository): Response
    {
        $reservations = $reservationRepository->findAll();

        return $this->render('backoffice/backoffice.html.twig', [
            'reservations' => $reservations,
        ]);
    }

    // Form submit route
    #[Route('/reservation/submit', name: 'reservation_submit', methods: ['POST'])]
    public function submit(
        Request $request,
        EntityManagerInterface $em,
        PrestationRepository $prestationRepo
    ): Response {
        $reservation = new Reservation();
        $reservation->setNom($request->request->get('nom'));
        $reservation->setPrenom($request->request->get('prenom'));
        $reservation->setTelephone($request->request->get('telephone'));
        $reservation->setEmail($request->request->get('email'));

        $dateReservation = $request->request->get('date_reservation');
        if ($dateReservation) {
            $reservation->setDateReservation(new \DateTime($dateReservation));
        }

        $reservation->setHoraire($request->request->get('horaire'));
        $reservation->setAdresse($request->request->get('adresse'));
        $reservation->setCodePostal($request->request->get('code_postal'));
        $reservation->setVille($request->request->get('ville'));
        $reservation->setStatut('en_attente');
        $reservation->setCreatedAt(new \DateTime());

        // Handle prestations
        $prestationsKeys = $request->request->all('prestations');
        $precisions = $request->request->all('precisions');

        $prestationMapping = [
            'manucure' => 'MANUCURE',
            'pedicure' => 'PÉDICURE',
            'soin-visage' => 'SOIN VISAGE',
            'maquillage' => 'MAQUILLAGE',
            'soin-corps' => 'SOIN CORPS',
            'epilation' => 'ÉPILATION'
        ];

        $totalPrice = 0;

        foreach ($prestationsKeys as $index => $key) {
            if (empty($key)) continue;

            $prestationName = $prestationMapping[$key] ?? strtoupper($key);
            $prestation = $prestationRepo->findOneBy(['nom' => $prestationName]);

            if (!$prestation) continue;

            $reservationPrestation = new ReservationPrestation();
            $reservationPrestation->setReservation($reservation);
            $reservationPrestation->setPrestation($prestation);

            if (isset($precisions[$index]) && !empty($precisions[$index])) {
                $reservationPrestation->setPrecisions($precisions[$index]);
            }

            $reservation->addReservationPrestation($reservationPrestation);
            $totalPrice += $prestation->getPrix();
        }

        // Add extra charge for certain cities
        $ville = $reservation->getVille();
        if (in_array($ville, ['Nogent sur Seine', 'Bar sur Aube'])) {
            $totalPrice += 5;
        }

        $reservation->setPrixTotal($totalPrice);

        $em->persist($reservation);
        $em->flush();

        return $this->redirectToRoute('reservation_confirmation');
    }

    // Confirmation page
    #[Route('/reservation/confirmation', name: 'reservation_confirmation')]
    public function confirmation(): Response
    {
        return $this->render('reservation/confirmation.html.twig', [
            'page_title' => 'Confirmation',
        ]);
    }
}
