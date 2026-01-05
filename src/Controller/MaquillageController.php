<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class MaquillageController extends AbstractController
{
    #[Route('/maquillage', name: 'app_maquillage')]
    public function index(): Response
    {
        return $this->render('maquillage/maquillage.html.twig', [
            'page_title' => 'Maquillage',
        ]);
    }
}
