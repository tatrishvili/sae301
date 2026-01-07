<?php

namespace App\Controller;

use App\Entity\Reservation;
use App\Entity\ReservationPrestation;
use App\Repository\PrestationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

final class ReservationController extends AbstractController
{
    private RequestStack $requestStack;

    public function __construct(RequestStack $requestStack)
    {
        $this->requestStack = $requestStack;
    }

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
                $reservationPrestation->setPrecision($precisions[$index]);
            }

            $reservation->addReservationPrestation($reservationPrestation);
            $totalPrice += $prestation->getPrix();
        }

        if (in_array($reservation->getVille(), ['Nogent sur Seine', 'Bar sur Aube'])) {
            $totalPrice += 5;
        }

        $reservation->setPrixTotal($totalPrice);

        $em->persist($reservation);
        $em->flush();

        // Add flash
        $request->getSession()->getFlashBag()->add('reservation_created', true);

        return $this->redirectToRoute('reservation_confirmation');
    }

    #[Route('/reservation/confirmation', name: 'reservation_confirmation')]
    public function confirmation(): Response
    {
        $session = $this->requestStack->getSession();
        $flashBag = $session->getFlashBag();

        // Prevent direct access
        if (!$flashBag->has('reservation_created')) {
            return $this->redirectToRoute('home'); // or another safe page
        }

        return $this->render('reservation/confirmation.html.twig', [
            'page_title' => 'Confirmation',
        ]);
    }
}
