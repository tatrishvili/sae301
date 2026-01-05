<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class SoinVisageController extends AbstractController
{
    #[Route('/soin/visage', name: 'app_soin_visage')]
    public function index(): Response
    {
        return $this->render('soin_visage/soin-visage.html.twig', [
            'page_title' => 'Soin Visage',
        ]);
    }
}
