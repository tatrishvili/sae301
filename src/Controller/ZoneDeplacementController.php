<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class ZoneDeplacementController extends AbstractController
{
    #[Route('/zone-deplacement', name: 'app_zone_deplacement')]
    public function index(): Response
    {
        return $this->render('zone_deplacement/deplacement.html.twig', [
            'page_title' => 'Déplacement',
        ]);
    }
}
