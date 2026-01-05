<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class SoinCorpsController extends AbstractController
{
    #[Route('/soin/corps', name: 'app_soin_corps')]
    public function index(): Response
    {
        return $this->render('soin_corps/soin-corps.html.twig', [
            'page_title' => 'Soin Corps',
        ]);
    }
}
